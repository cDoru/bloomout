#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import abort, Flask, jsonify, request
import os
from os import environ
app = Flask(__name__)
from watson import nltk, tone, personality
import datetime
import pymongo
from bson.json_util import dumps
from mongo_base import employees, messages
from graph import build_graph

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/history', methods=['GET'])
def history():
    return dumps(messages.find().sort('date', pymongo.DESCENDING))

@app.route('/api/chat', methods=['POST'])
def chat():
    req = request.get_json()
    if "body" not in req:
        abort(400, "No text provided.")
    resp = nltk(req["body"])
    messages.insert_one({
        "emotion": resp,
        "from": req["from"],
        "to": req["to"],
        "body": req["body"],
        'created_at': datetime.datetime.now()
    })
    return jsonify(resp)

@app.route('/api/graph', methods=['GET'])
def graph():
    return jsonify(build_graph())

if __name__ == '__main__':
    port = environ.get("PORT", "6001")
    app.run(debug=True, port=int(port), use_reloader=True)