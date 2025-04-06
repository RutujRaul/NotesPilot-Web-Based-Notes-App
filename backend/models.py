from flask_pymongo import PyMongo
from config import MONGO_URI

mongo = PyMongo()

class User:
    def __init__(self, email, password):
        self.email = email
        self.password = password

    def save(self):
        user_collection = mongo.db.users
        user_collection.insert_one({
            'email': self.email,
            'password': self.password
        })

    @staticmethod
    def query():
        user_collection = mongo.db.users
        return user_collection

class Note:
    def __init__(self, user_id, content):
        self.user_id = user_id
        self.content = content

    def save(self):
        notes_collection = mongo.db.notes
        notes_collection.insert_one({
            'user_id': self.user_id,
            'content': self.content
        })

    @staticmethod
    def query():
        notes_collection = mongo.db.notes
        return notes_collection
