from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import MONGO_URI, SECRET_KEY
from bson import ObjectId

app = Flask(__name__)

# ✅ Enable CORS for frontend at localhost:3000 with credentials support
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# ✅ Configuration
app.config['SECRET_KEY'] = SECRET_KEY
app.config['MONGO_URI'] = MONGO_URI

mongo = PyMongo(app)

# ---------------------- User Signup ----------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    existing_user = mongo.db.users.find_one({'email': data['email']})
    if existing_user:
        return jsonify({'message': 'Email already in use'}), 400

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    new_user = {
        'email': data['email'],
        'password': hashed_password
    }
    mongo.db.users.insert_one(new_user)

    return jsonify({'message': 'User created successfully'}), 201

# ---------------------- User Login ----------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    user = mongo.db.users.find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token}), 200

# ---------------------- Get Notes (Protected) ----------------------
@app.route('/notes', methods=['GET'])
def get_notes():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing'}), 403

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = data['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 403
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 403

    user_notes = mongo.db.notes.find({'user_id': user_id})
    notes_list = [
        {
            "id": str(note['_id']),
            "content": note['content'],
            "timestamp": note['timestamp'].isoformat() if 'timestamp' in note else None
        }
        for note in user_notes
    ]

    return jsonify(notes_list), 200

# ---------------------- Add Note (Protected) ----------------------
@app.route('/notes', methods=['POST'])
def add_note():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing'}), 403

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = data['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 403
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 403

    note_data = request.get_json()
    if not note_data or not note_data.get('content'):
        return jsonify({'message': 'Note content required'}), 400

    note = {
        'user_id': user_id,
        'content': note_data['content'],
        'timestamp': datetime.datetime.utcnow()
    }

    mongo.db.notes.insert_one(note)
    return jsonify({'message': 'Note added successfully'}), 201

# ---------------------- Main ----------------------
if __name__ == '__main__':
    app.run(debug=True)
