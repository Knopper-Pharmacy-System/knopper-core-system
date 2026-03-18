from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from extensions import mysql

stock_receiving_bp = Blueprint('stock_receiving', __name__)


def next_id(cursor, table, id_col):
    """Auto-generate the next ID for any table."""
    cursor.execute(f"SELECT IFNULL(MAX({id_col}), 0) + 1 FROM {table}")
    return cursor.fetchone()[0]


# ─────────────────────────────────────────────
# GET /stock-receiving/pending
# Returns all POs that are APPROVED or SENT (ready to receive)
# Access: admin, manager
# ─────────────────────────────────────────────
@stock_receiving_bp.route('/stock-receiving/pending', methods=['GET'])
@jwt_required()
def get_pending_deliveries():
    claims = get_jwt()
    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            SELECT 
                po.order_id,
                po.order_date,
                po.status,
                po.total_amount,
                s.supplier_name,
                b.branch_name,
                creator.full_name AS created_by
            FROM PURCHASE_ORDERS po
            LEFT JOIN SUPPLIERS s ON po.supplier_id = s.supplier_id
            LEFT JOIN BRANCHES b ON po.branch_id = b.branch_id
            LEFT JOIN USERS creator ON po.created_by_user_id = creator.user_id
            WHERE po.status IN ('APPROVED', 'SENT')
            ORDER BY po.order_date ASC
        """)
        rows = cur.fetchall()

        return jsonify([{
            "order_id": r[0],
            "order_date": r[1].strftime('%Y-%m-%d') if r[1] else None,
            "status": r[2],
            "total_amount": float(r[3]) if r[3] else 0.00,
            "supplier": r[4],
            "branch": r[5],
            "created_by": r[6]
        } for r in rows]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ─────────────────────────────────────────────
# GET /stock-receiving/<order_id>
# Returns full PO details + items, ready for receiving form
# Access: admin, manager
# ─────────────────────────────────────────────
@stock_receiving_bp.route('/stock-receiving/<int:order_id>', methods=['GET'])
@jwt_required()
def get_receiving_detail(order_id):
    claims = get_jwt()
    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            SELECT 
                po.order_id, po.order_date, po.status, po.total_amount,
                s.supplier_name, b.branch_name, b.branch_id,
                creator.full_name
            FROM PURCHASE_ORDERS po
            LEFT JOIN SUPPLIERS s ON po.supplier_id = s.supplier_id
            LEFT JOIN BRANCHES b ON po.branch_id = b.branch_id
            LEFT JOIN USERS creator ON po.created_by_user_id = creator.user_id
            WHERE po.order_id = %s
        """, (order_id,))
        po = cur.fetchone()

        if not po:
            return jsonify({"message": f"PO {order_id} not found."}), 404

        cur.execute("""
            SELECT 
                poi.po_item_id,
                p.product_id,
                p.product_name_official,
                poi.quantity_ordered,
                poi.uom,
                poi.cost_at_time_of_order,
                poi.item_status
            FROM PURCHASE_ORDER_ITEMS poi
            JOIN PRODUCTS p ON poi.product_id = p.product_id
            WHERE poi.order_id = %s
        """, (order_id,))
        items = cur.fetchall()

        return jsonify({
            "order_id": po[0],
            "order_date": po[1].strftime('%Y-%m-%d') if po[1] else None,
            "status": po[2],
            "total_amount": float(po[3]) if po[3] else 0.00,
            "supplier": po[4],
            "branch": po[5],
            "branch_id": po[6],
            "created_by": po[7],
            "items": [{
                "po_item_id": i[0],
                "product_id": i[1],
                "product_name": i[2],
                "quantity_ordered": i[3],
                "uom": i[4],
                "cost": float(i[5]) if i[5] else 0.00,
                "item_status": i[6]
            } for i in items]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ─────────────────────────────────────────────
# POST /stock-receiving/receive
# Receives a PO delivery — updates BRANCH_INVENTORY and logs STOCK_ADJUSTMENTS
#
# Expected body:
# {
#   "order_id": 1,
#   "items": [
#     {
#       "po_item_id": 10,
#       "product_id": 5,
#       "quantity_received": 50,
#       "batch_number": "BATCH-001",       ← optional
#       "expiry_date": "2027-01-01",       ← optional, format: YYYY-MM-DD
#       "gondola_code": "A1"               ← optional, falls back to first gondola found
#     }
#   ]
# }
#
# Access: admin, manager
# ─────────────────────────────────────────────
@stock_receiving_bp.route('/stock-receiving/receive', methods=['POST'])
@jwt_required()
def receive_stock():
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())

    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    data     = request.json
    order_id = data.get('order_id')
    items    = data.get('items', [])

    if not order_id or not items:
        return jsonify({"message": "Validation Error: 'order_id' and 'items' are required."}), 400

    cur = mysql.connection.cursor()
    try:
        # ── 1. Validate the PO ───────────────────────────────────────────
        cur.execute("""
            SELECT status, branch_id 
            FROM PURCHASE_ORDERS 
            WHERE order_id = %s
        """, (order_id,))
        po = cur.fetchone()

        if not po:
            return jsonify({"message": f"PO {order_id} not found."}), 404
        if po[0] == 'CANCELLED':
            return jsonify({"message": "Cannot receive a CANCELLED PO."}), 400
        if po[0] == 'RECEIVED':
            return jsonify({"message": "This PO has already been fully received."}), 400
        if po[0] not in ('APPROVED', 'SENT', 'DRAFT'):
            return jsonify({"message": f"PO status is '{po[0]}'. Only APPROVED or SENT POs can be received."}), 400

        branch_id = po[1]

        # ── 2. Create the Receiving Report header ────────────────────────
        receipt_id = next_id(cur, 'RECEIVING_REPORTS', 'receipt_id')
        cur.execute("""
            INSERT INTO RECEIVING_REPORTS
            (receipt_id, order_id, received_by_user_id, date_received)
            VALUES (%s, %s, %s, NOW())
        """, (receipt_id, order_id, current_user_id))

        received_summary = []

        # ── 3. Process each item ─────────────────────────────────────────
        for item in items:
            po_item_id        = item.get('po_item_id')
            product_id        = item.get('product_id')
            quantity_received = item.get('quantity_received')
            batch_number      = item.get('batch_number')
            expiry_date       = item.get('expiry_date')   # 'YYYY-MM-DD' or None
            gondola_code      = item.get('gondola_code')

            # Basic field validation
            if not all([po_item_id, product_id, quantity_received]):
                raise ValueError(f"Each item requires po_item_id, product_id, and quantity_received. Problem item: {item}")
            if int(quantity_received) <= 0:
                raise ValueError(f"quantity_received must be greater than 0 for product_id {product_id}.")

            # ── 3a. Verify the po_item belongs to this PO ────────────────
            cur.execute("""
                SELECT quantity_ordered, item_status 
                FROM PURCHASE_ORDER_ITEMS 
                WHERE po_item_id = %s AND order_id = %s
            """, (po_item_id, order_id))
            po_item = cur.fetchone()
            if not po_item:
                raise ValueError(f"PO item {po_item_id} does not belong to PO {order_id}.")

            # ── 3b. Resolve gondola ───────────────────────────────────────
            gondola_id = None
            if gondola_code:
                cur.execute("""
                    SELECT gondola_id 
                    FROM GONDOLAS 
                    WHERE gondola_code = %s AND branch_id = %s
                """, (gondola_code, branch_id))
                gondola_row = cur.fetchone()
                if gondola_row:
                    gondola_id = gondola_row[0]

            # Fall back to any gondola in this branch if none matched
            if not gondola_id:
                cur.execute("""
                    SELECT gondola_id 
                    FROM GONDOLAS 
                    WHERE branch_id = %s 
                    LIMIT 1
                """, (branch_id,))
                fallback = cur.fetchone()
                if fallback:
                    gondola_id = fallback[0]

            # ── 3c. Upsert BRANCH_INVENTORY ──────────────────────────────
            if batch_number:
                cur.execute("""
                    SELECT inventory_id, quantity_on_hand 
                    FROM BRANCH_INVENTORY 
                    WHERE product_id = %s AND branch_id = %s AND batch_number = %s
                """, (product_id, branch_id, batch_number))
            else:
                cur.execute("""
                    SELECT inventory_id, quantity_on_hand 
                    FROM BRANCH_INVENTORY 
                    WHERE product_id = %s AND branch_id = %s AND batch_number IS NULL
                """, (product_id, branch_id))

            existing_inv = cur.fetchone()

            if existing_inv:
                inventory_id = existing_inv[0]
                cur.execute("""
                    UPDATE BRANCH_INVENTORY 
                    SET quantity_on_hand = quantity_on_hand + %s
                    WHERE inventory_id = %s
                """, (quantity_received, inventory_id))
            else:
                inventory_id = next_id(cur, 'BRANCH_INVENTORY', 'inventory_id')
                cur.execute("""
                    INSERT INTO BRANCH_INVENTORY
                    (inventory_id, branch_id, product_id, gondola_id, reorder_level, 
                     target_stock_level, batch_number, expiry_date, quantity_on_hand)
                    VALUES (%s, %s, %s, %s, 10, 100, %s, %s, %s)
                """, (inventory_id, branch_id, product_id, gondola_id,
                      batch_number, expiry_date, quantity_received))

            # ── 3d. Update global product stock total ────────────────────
            cur.execute("""
                UPDATE PRODUCTS 
                SET total_stock_quantity = IFNULL(total_stock_quantity, 0) + %s 
                WHERE product_id = %s
            """, (quantity_received, product_id))

            # ── 3e. Log to STOCK_ADJUSTMENTS ─────────────────────────────
            remarks = f"Stock received via PO #{order_id} (Receipt #{receipt_id})"
            if batch_number:
                remarks += f" | Batch: {batch_number}"
            if gondola_code:
                remarks += f" | Gondola: {gondola_code}"

            cur.execute("""
                INSERT INTO STOCK_ADJUSTMENTS
                (inventory_id, user_id, adjustment_type, quantity_adjusted, date_adjusted, remarks)
                VALUES (%s, %s, 'STOCK_IN', %s, %s, %s)
            """, (inventory_id, current_user_id, quantity_received, datetime.now(), remarks))

            # ── 3f. Log to RECEIPT_ITEMS ─────────────────────────────────
            receipt_item_id = next_id(cur, 'RECEIPT_ITEMS', 'receipt_item_id')
            cur.execute("""
                INSERT INTO RECEIPT_ITEMS
                (receipt_item_id, receipt_id, po_item_id, quantity_received, batch_number, expiry_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (receipt_item_id, receipt_id, po_item_id, quantity_received, batch_number, expiry_date))

            # ── 3g. Mark PO item as RECEIVED ─────────────────────────────
            cur.execute("""
                UPDATE PURCHASE_ORDER_ITEMS 
                SET item_status = 'RECEIVED' 
                WHERE po_item_id = %s
            """, (po_item_id,))

            received_summary.append({
                "po_item_id": po_item_id,
                "product_id": product_id,
                "quantity_received": quantity_received,
                "batch_number": batch_number,
                "expiry_date": expiry_date,
                "inventory_id": inventory_id
            })

        # ── 4. Mark the PO as RECEIVED ───────────────────────────────────
        cur.execute("""
            UPDATE PURCHASE_ORDERS 
            SET status = 'RECEIVED' 
            WHERE order_id = %s
        """, (order_id,))

        mysql.connection.commit()

        return jsonify({
            "message": f"Stock received successfully for PO #{order_id}.",
            "receipt_id": receipt_id,
            "order_id": order_id,
            "items_received": received_summary
        }), 201

    except ValueError as ve:
        mysql.connection.rollback()
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ─────────────────────────────────────────────
# GET /stock-receiving/history
# Returns all completed receiving reports
# Access: admin, manager
# ─────────────────────────────────────────────
@stock_receiving_bp.route('/stock-receiving/history', methods=['GET'])
@jwt_required()
def get_receiving_history():
    claims = get_jwt()
    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            SELECT 
                rr.receipt_id,
                rr.order_id,
                rr.date_received,
                u.full_name AS received_by,
                s.supplier_name,
                b.branch_name,
                COUNT(ri.receipt_item_id) AS total_items
            FROM RECEIVING_REPORTS rr
            LEFT JOIN PURCHASE_ORDERS po ON rr.order_id = po.order_id
            LEFT JOIN SUPPLIERS s ON po.supplier_id = s.supplier_id
            LEFT JOIN BRANCHES b ON po.branch_id = b.branch_id
            LEFT JOIN USERS u ON rr.received_by_user_id = u.user_id
            LEFT JOIN RECEIPT_ITEMS ri ON rr.receipt_id = ri.receipt_id
            GROUP BY rr.receipt_id, rr.order_id, rr.date_received,
                     u.full_name, s.supplier_name, b.branch_name
            ORDER BY rr.date_received DESC
        """)
        rows = cur.fetchall()

        return jsonify([{
            "receipt_id": r[0],
            "order_id": r[1],
            "date_received": r[2].strftime('%Y-%m-%d %H:%M') if r[2] else None,
            "received_by": r[3],
            "supplier": r[4],
            "branch": r[5],
            "total_items": r[6]
        } for r in rows]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ─────────────────────────────────────────────
# GET /stock-receiving/history/<receipt_id>
# Returns full detail of a specific receiving report
# Access: admin, manager
# ─────────────────────────────────────────────
@stock_receiving_bp.route('/stock-receiving/history/<int:receipt_id>', methods=['GET'])
@jwt_required()
def get_receiving_report_detail(receipt_id):
    claims = get_jwt()
    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            SELECT 
                rr.receipt_id, rr.order_id, rr.date_received,
                u.full_name AS received_by,
                s.supplier_name, b.branch_name
            FROM RECEIVING_REPORTS rr
            LEFT JOIN PURCHASE_ORDERS po ON rr.order_id = po.order_id
            LEFT JOIN SUPPLIERS s ON po.supplier_id = s.supplier_id
            LEFT JOIN BRANCHES b ON po.branch_id = b.branch_id
            LEFT JOIN USERS u ON rr.received_by_user_id = u.user_id
            WHERE rr.receipt_id = %s
        """, (receipt_id,))
        report = cur.fetchone()

        if not report:
            return jsonify({"message": f"Receipt #{receipt_id} not found."}), 404

        cur.execute("""
            SELECT 
                ri.receipt_item_id,
                p.product_name_official,
                ri.quantity_received,
                ri.batch_number,
                ri.expiry_date
            FROM RECEIPT_ITEMS ri
            JOIN PURCHASE_ORDER_ITEMS poi ON ri.po_item_id = poi.po_item_id
            JOIN PRODUCTS p ON poi.product_id = p.product_id
            WHERE ri.receipt_id = %s
        """, (receipt_id,))
        items = cur.fetchall()

        return jsonify({
            "receipt_id": report[0],
            "order_id": report[1],
            "date_received": report[2].strftime('%Y-%m-%d %H:%M') if report[2] else None,
            "received_by": report[3],
            "supplier": report[4],
            "branch": report[5],
            "items": [{
                "receipt_item_id": i[0],
                "product_name": i[1],
                "quantity_received": i[2],
                "batch_number": i[3],
                "expiry_date": i[4].strftime('%Y-%m-%d') if i[4] else None
            } for i in items]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()