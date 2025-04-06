from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
import datetime
import os
from config import MONGO_URI, SECRET_KEY

app = Flask(__name__)
CORS(app)
# MongoDB setup
client = MongoClient(MONGO_URI)
db = client['keepnotes']
users_collection = db['users']
notes_collection = db['notes']

# Helper function to verify JWT token
def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Signup Route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']
    password = data['password']

    existing_user = users_collection.find_one({'email': email})
    if existing_user:
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_collection.insert_one({'email': email, 'password': hashed_password})
    return jsonify({'message': 'User created successfully'}), 201

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = users_collection.find_one({'email': email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# Get Notes (Protected)
@app.route('/notes', methods=['GET'])
def get_notes():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    email = verify_token(token)
    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 401

    notes = list(notes_collection.find({'email': email}))
    for note in notes:
        note['_id'] = str(note['_id'])
    return jsonify(notes)

# Add Note (Protected)
@app.route('/notes', methods=['POST'])
def add_note():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    email = verify_token(token)
    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 401

    data = request.get_json()
    note = {
        'email': email,
        'content': data['content'],
        'timestamp': datetime.datetime.utcnow()
    }
    result = notes_collection.insert_one(note)
    note['_id'] = str(result.inserted_id)
    return jsonify(note), 201

# Edit Note
@app.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    email = verify_token(token)
    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 401

    data = request.get_json()
    updated_note = {
        'content': data['content'],
        'timestamp': datetime.datetime.utcnow()
    }
    result = notes_collection.update_one(
        {'_id': ObjectId(note_id), 'email': email},
        {'$set': updated_note}
    )
    if result.modified_count == 1:
        return jsonify({'message': 'Note updated successfully'})
    return jsonify({'message': 'Note not found or not authorized'}), 404

# Delete Note
@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    email = verify_token(token)
    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 401

    result = notes_collection.delete_one({'_id': ObjectId(note_id), 'email': email})
    if result.deleted_count == 1:
        return jsonify({'message': 'Note deleted successfully'})
    return jsonify({'message': 'Note not found or not authorized'}), 404

if __name__ == '__main__':
    app.run(debug=True)
