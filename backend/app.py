from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
# Added 'get_jwt' to imports
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta

app = Flask(__name__)

# --- Configuration ---
app.config['MYSQL_HOST'] = 'turntable.proxy.rlwy.net'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'KnopperSuperSafetyPassword' # Add your password here
app.config['MYSQL_DB'] = 'Knopper_Database'
app.config['JWT_SECRET_KEY'] = 'knopper-super-secret-key' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)

mysql = MySQL(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==========================================
# ROUTE: CREATE USER (RBAC Enabled)
# ==========================================
@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    # --- FIX START ---
    # We use get_jwt() to access the custom claims (role/branch) we set in login
    claims = get_jwt()
    current_role = claims['role']
    # --- FIX END ---

    # ROLE LOGIC: 
    data = request.json
    target_role = data.get('role')
    
    if current_role == 'staff':
        return jsonify({"message": "Access Denied: Staff cannot create accounts"}), 403
    
    if current_role == 'manager' and target_role in ['admin', 'manager']:
        return jsonify({"message": "Access Denied: Managers can only create Staff accounts"}), 403

    # Extract Data
    u_id = data.get('user_id')
    b_id = data.get('branch_id')
    uname = data.get('username')
    fname = data.get('full_name')
    pwd = data.get('password')

    hashed_pwd = bcrypt.generate_password_hash(pwd).decode('utf-8')

    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            INSERT INTO USERS (user_id, branch_id, username, password_hash, full_name, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (u_id, b_id, uname, hashed_pwd, fname, target_role))
        mysql.connection.commit()
        return jsonify({"message": f"User {uname} created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

# ==========================================
# ROUTE: LOGIN (FIXED)
# ==========================================
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id, password_hash, role, branch_id FROM USERS WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()

    if user and bcrypt.check_password_hash(user[1], password):
        # --- FIX START ---
        # 1. Identity MUST be a string (User ID)
        identity = str(user[0]) 
        
        # 2. Store Role and Branch in 'additional_claims'
        claims = {
            "role": user[2],
            "branch": user[3]
        }
        
        # Create the token correctly
        token = create_access_token(identity=identity, additional_claims=claims)
        # --- FIX END ---
        
        return jsonify({"access_token": token, "role": user[2]}), 200
    
    return jsonify({"message": "Invalid Credentials"}), 401

# ==========================================
# ROUTE: SETUP ADMIN (Protected by Header Key)
# ==========================================
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
    # Optional: Check if the requester is an Admin/Manager if you want to restrict this
    # claims = get_jwt()
    # if claims['role'] not in ['admin', 'manager']:
    #     return jsonify({"message": "Access Denied"}), 403

    cur = mysql.connection.cursor()
    try:
        # We join with BRANCHES so we see "BMC Main" instead of just "1"
        sql = """
            SELECT u.user_id, u.username, u.full_name, u.role, b.branch_name, u.is_active 
            FROM USERS u
            LEFT JOIN BRANCHES b ON u.branch_id = b.branch_id
            ORDER BY u.branch_id, u.role
        """
        cur.execute(sql)
        users = cur.fetchall()

        # Convert the list of tuples into a clean JSON list
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
# update user pass

@app.route('/update-password', methods=['PUT'])
@jwt_required()
def update_password():
    # 1. Get the Identity of the person currently logged in
    current_user_id = str(get_jwt_identity()) # The ID in the token
    claims = get_jwt()
    current_role = claims['role']             # The Role in the token

    # 2. Get Data from Postman
    data = request.json
    target_user_id = str(data.get('user_id')) # Who are we changing?
    new_password = data.get('new_password')
    old_password = data.get('old_password')   # Required if changing your own

    if not new_password or not target_user_id:
        return jsonify({"message": "Missing user_id or new_password"}), 400

    # 3. SECURITY CHECK (The "Restriction")
    # Rule: If you are NOT an admin, you can ONLY change your own ID.
    if current_role != 'admin' and current_user_id != target_user_id:
        return jsonify({"message": "Access Denied: You can only change your own password."}), 403

    cur = mysql.connection.cursor()

    try:
        # 4. SCENARIO A: Changing OWN password (Requires Old Password check)
        if current_user_id == target_user_id:
            if not old_password:
                return jsonify({"message": "Please provide your old password"}), 400
            
            # Verify the old password matches the DB
            cur.execute("SELECT password_hash FROM USERS WHERE user_id = %s", (current_user_id,))
            user = cur.fetchone()
            if not user or not bcrypt.check_password_hash(user[0], old_password):
                return jsonify({"message": "Incorrect old password"}), 401

        # 5. EXECUTE UPDATE (Hash the new password)
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        cur.execute("UPDATE USERS SET password_hash = %s WHERE user_id = %s", (hashed_pw, target_user_id))
        mysql.connection.commit()
        
        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

#---------------PRODUCTS---------------------------------------------------------






if __name__ == '__main__':
    app.run(debug=True)