import os
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_USER'] = os.getenv('DB_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD') 
app.config['MYSQL_DB'] = os.getenv('DB_NAME')
app.config['MYSQL_PORT'] = int(os.getenv('DB_PORT')) 

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET') 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)

mysql = MySQL(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ROUTE: CREATE USER 
@app.route('/create-user', methods=['POST'])
@jwt_required()
def create_user():
    # --- 1. GET ROLE OF CURRENT USER ---
    claims = get_jwt()
    current_role = claims['role']

    # --- 2. GET DATA FROM POSTMAN ---
    data = request.json
    target_role = data.get('role')
    u_id = data.get('user_id')
    b_id = data.get('branch_id')
    uname = data.get('username')
    fname = data.get('full_name')
    pwd = data.get('password')

    # --- 3. STRICT VALIDATION: Check for missing or empty fields ---
    if not all([u_id, b_id, uname, fname, pwd, target_role]):
        return jsonify({
            "message": "Validation Error: All fields (user_id, branch_id, username, password, full_name, role) are required and cannot be empty."
        }), 400

    # --- 4. ROLE LOGIC ---
    if current_role == 'staff':
        return jsonify({"message": "Access Denied: Staff cannot create accounts"}), 403
    
    if current_role == 'manager' and target_role in ['admin', 'manager']:
        return jsonify({"message": "Access Denied: Managers can only create Staff accounts"}), 403

    cur = mysql.connection.cursor()
    try:
        # --- 5. DUPLICATE CHECK: Look for existing ID, Username, or Name IN THE SAME BRANCH ---
        cur.execute("""
            SELECT user_id, username, full_name, branch_id 
            FROM USERS 
            WHERE user_id = %s 
               OR username = %s 
               OR (full_name = %s AND branch_id = %s)
        """, (u_id, uname, fname, b_id))
        
        existing_user = cur.fetchone()
        
        # If a match is found, check exactly what triggered it
        if existing_user:
            if existing_user[0] == int(u_id):
                return jsonify({"message": f"Conflict: The user_id '{u_id}' is already in use."}), 409
            
            if existing_user[1] == uname:
                return jsonify({"message": f"Conflict: The username '{uname}' is already taken. Please choose another."}), 409
            
            # Check if the name AND the branch match
            if existing_user[2] == fname and existing_user[3] == int(b_id):
                return jsonify({"message": f"Conflict: '{fname}' is already registered at Branch {b_id}."}), 409

        # --- 6. HASH PASSWORD & INSERT TO DATABASE ---
        hashed_pwd = bcrypt.generate_password_hash(pwd).decode('utf-8')

        # Added 'is_active' and 'TRUE' to the SQL command
        cur.execute("""
            INSERT INTO USERS (user_id, branch_id, username, password_hash, full_name, role, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
        """, (u_id, b_id, uname, hashed_pwd, fname, target_role))
        
        mysql.connection.commit()
        return jsonify({"message": f"User {uname} created successfully!"}), 201

    except Exception as e:
        mysql.connection.rollback() 
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

# ROUTE: LOGIN
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id, password_hash, role, branch_id, is_active FROM USERS WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()

    if user and bcrypt.check_password_hash(user[1], password):
        
        if not user[4]: 
            return jsonify({"message": "Account is inactive. Please contact your administrator."}), 403

        identity = str(user[0]) 
        
        claims = {
            "role": user[2],
            "branch": user[3]
        }
        
        token = create_access_token(identity=identity, additional_claims=claims)
     
        
        return jsonify({"access_token": token, "role": user[2]}), 200
    
    return jsonify({"message": "Invalid Credentials"}), 401

# ROUTE: SETUP ADMIN 

@app.route('/setup-admin', methods=['POST'])
def setup_admin():
    # 1. SECURITY CHECK: Check for the secret header
    setup_key = request.headers.get('X-Setup-Key')
    
    if setup_key != "Knopper-Init-2026":
        return jsonify({"message": "Forbidden: Invalid Setup Key"}), 403

    # 2. CREATE ADMIN LOGIC
    data = request.json
    
    if not data or not data.get('password'):
        return jsonify({"message": "Missing password"}), 400

    hashed_pwd = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    
    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            INSERT INTO USERS (user_id, branch_id, username, password_hash, full_name, role)
            VALUES (%s, %s, %s, %s, %s, 'admin')
        """, (data.get('user_id'), data.get('branch_id'), data.get('username'), hashed_pwd, data.get('full_name')))
        
        mysql.connection.commit()
        return jsonify({"message": "Superadmin created successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

@app.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    # Check if the requester is an Admin/Manager if you want to restrict this
    claims = get_jwt()
    if claims['role'] not in ['admin', 'manager']:
        return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        sql = """
            SELECT u.user_id, u.username, u.full_name, u.role, b.branch_name, u.is_active 
            FROM USERS u
            LEFT JOIN BRANCHES b ON u.branch_id = b.branch_id
            ORDER BY u.branch_id, u.role
        """
        cur.execute(sql)
        users = cur.fetchall()

        user_list = []
        for user in users:
            user_list.append({
                "user_id": user[0],
                "username": user[1],
                "full_name": user[2],
                "role": user[3],
                "branch": user[4],
                "status": "Active" if user[5] else "Inactive"
            })

        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

@app.route('/update-users/<int:target_user_id>', methods=['PUT'])
@jwt_required()
def edit_user(target_user_id):
    # 1. STRICT SECURITY CHECK: Only Admins allowed
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"message": "Access Denied: Only Administrators can edit user profiles."}), 403

    data = request.json
    if not data:
        return jsonify({"message": "No data provided to update."}), 400

    username = data.get('username')
    full_name = data.get('full_name')
    role = data.get('role')
    branch_id = data.get('branch_id')
    is_active = data.get('is_active') # True or False
    password = data.get('password')

    cur = mysql.connection.cursor()
    try:
        # 3. VERIFY USER EXISTS
        cur.execute("SELECT * FROM USERS WHERE user_id = %s", (target_user_id,))
        if not cur.fetchone():
            return jsonify({"message": f"User ID {target_user_id} not found."}), 404

        # 4. DUPLICATE CHECK (Exclude the current user we are editing)
        if username or (full_name and branch_id):
            cur.execute("""
                SELECT user_id, username, full_name, branch_id 
                FROM USERS 
                WHERE user_id != %s 
                  AND (username = %s OR (full_name = %s AND branch_id = %s))
            """, (target_user_id, username, full_name, branch_id))
            
            conflict = cur.fetchone()
            if conflict:
                if conflict[1] == username:
                    return jsonify({"message": f"Conflict: Username '{username}' is already taken."}), 409
                if conflict[2] == full_name and conflict[3] == int(branch_id):
                    return jsonify({"message": f"Conflict: '{full_name}' already exists in Branch {branch_id}."}), 409

        # 5. DYNAMICALLY BUILD THE UPDATE QUERY
        update_fields = []
        update_values = []

        if username:
            update_fields.append("username = %s")
            update_values.append(username)
        if full_name:
            update_fields.append("full_name = %s")
            update_values.append(full_name)
        if role:
            update_fields.append("role = %s")
            update_values.append(role)
        if branch_id:
            update_fields.append("branch_id = %s")
            update_values.append(branch_id)
        if is_active is not None:  # is_active could be False, so we check 'is not None'
            update_fields.append("is_active = %s")
            update_values.append(is_active)
        if password:
            hashed_pwd = bcrypt.generate_password_hash(password).decode('utf-8')
            update_fields.append("password_hash = %s")
            update_values.append(hashed_pwd)

        if not update_fields:
            return jsonify({"message": "No valid fields provided to update."}), 400

        # Add the target_user_id to the very end of our values list for the WHERE clause
        update_values.append(target_user_id)

        # Assemble the final SQL string
        sql = f"UPDATE USERS SET {', '.join(update_fields)} WHERE user_id = %s"
        
        cur.execute(sql, tuple(update_values))
        mysql.connection.commit()

        return jsonify({"message": f"User ID {target_user_id} updated successfully!"}), 200

    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

# ROUTE: For PRODUCTS

@app.route('/products', methods=['GET'])
@jwt_required()
def get_all_products():
    cur = mysql.connection.cursor()
    try:
      
        sql = """
            SELECT product_id, product_name_official 
            FROM PRODUCTS 
            ORDER BY product_name_official ASC
        """
        cur.execute(sql)
        products = cur.fetchall()

       
        product_list = []
        for prod in products:
            product_list.append({
                "product_id": prod[0],
                "product_name_official": prod[1]
                
            })

        return jsonify(product_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()




# ROUTE: FOR INVENTORY
@app.route('/inventory/branch/<int:branch_id>', methods=['GET'])
@jwt_required()
def get_branch_inventory(branch_id):
    cur = mysql.connection.cursor()
    try:
        sql = """
            SELECT 
                bi.inventory_id,
                p.product_id,
                p.product_name_official,
                p.category_type,
                bi.batch_number,
                bi.expiry_date,
                bi.quantity_on_hand,
                p.price_regular
            FROM BRANCH_INVENTORY bi
            JOIN PRODUCTS p ON bi.product_id = p.product_id
            WHERE bi.branch_id = %s
            ORDER BY p.product_name_official ASC, bi.expiry_date ASC
        """
        cur.execute(sql, (branch_id,))
        inventory_items = cur.fetchall()

        inventory_list = []
        for item in inventory_items:
            inventory_list.append({
                "inventory_id": item[0],
                "product_id": item[1],
                "product_name": item[2],
                "category": item[3],
                "batch_number": item[4],
                # Dates need to be converted to strings for JSON formatting
                "expiry_date": item[5].strftime('%Y-%m-%d') if item[5] else None,
                "quantity_on_hand": item[6],
                "price": float(item[7]) if item[7] else 0.00
            })

        return jsonify(inventory_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

@app.route('/inventory/receive', methods=['POST'])
@jwt_required()
def receive_inventory():
    # 1. Get the Identity of the person receiving the stock
    claims = get_jwt()
    current_role = claims['role']
    
    # Optional: Restrict to managers and admins
    if current_role == 'staff':
        return jsonify({"message": "Access Denied: Only Managers/Admins can receive inventory"}), 403

    # 2. Get Data from Postman payload
    data = request.json
    
    inventory_id = data.get('inventory_id') # Manual ID based on your schema
    branch_id = data.get('branch_id')
    product_id = data.get('product_id')
    gondola_id = data.get('gondola_id') # Shelf location
    batch_number = data.get('batch_number')
    expiry_date = data.get('expiry_date') # Format: YYYY-MM-DD
    quantity = data.get('quantity_on_hand')
    reorder_level = data.get('reorder_level', 5) # Default to 5 if not provided
    target_stock = data.get('target_stock_level', 100) # Default to 100 if not provided

    # Basic Validation
    if not all([inventory_id, branch_id, product_id, batch_number, expiry_date, quantity]):
        return jsonify({"message": "Missing required fields (inventory_id, branch_id, product_id, batch_number, expiry_date, quantity_on_hand)"}), 400

    cur = mysql.connection.cursor()
    
    try:
        # 3. Insert the new batch into BRANCH_INVENTORY
        sql_insert = """
            INSERT INTO BRANCH_INVENTORY 
            (inventory_id, branch_id, product_id, gondola_id, reorder_level, target_stock_level, batch_number, expiry_date, quantity_on_hand)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cur.execute(sql_insert, (inventory_id, branch_id, product_id, gondola_id, reorder_level, target_stock, batch_number, expiry_date, quantity))
        
        # 4. (Optional but recommended) Update the Global Product total_stock_quantity
        sql_update_global = """
            UPDATE PRODUCTS 
            SET total_stock_quantity = IFNULL(total_stock_quantity, 0) + %s 
            WHERE product_id = %s
        """
        cur.execute(sql_update_global, (quantity, product_id))

        mysql.connection.commit()
        return jsonify({"message": f"Successfully received {quantity} units of Product {product_id} into Branch {branch_id}."}), 201

    except Exception as e:
        # If there's a Foreign Key error (e.g., product doesn't exist), it will be caught here
        mysql.connection.rollback() 
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


if __name__ == '__main__':
    app.run(debug=True)