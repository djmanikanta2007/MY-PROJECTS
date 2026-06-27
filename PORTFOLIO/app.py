import os
import sqlite3
import smtplib
from email.message import EmailMessage
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Allow cross-origin requests if needed

DB_NAME = 'portfolio.db'

def init_db():
    """Initialize the database and create the messages table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def send_email_notification(name, email, message):
    """Send an email notification when a new message is received."""
    email_user = os.environ.get('EMAIL_USER')
    email_pass = os.environ.get('EMAIL_PASSWORD')
    email_host = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    email_port = int(os.environ.get('EMAIL_PORT', 587))
    email_receiver = os.environ.get('EMAIL_RECEIVER')
    
    # If email isn't configured, skip sending
    if not all([email_user, email_pass, email_receiver]):
        print("Email configuration missing. Skipping email notification.")
        return False
        
    try:
        msg = EmailMessage()
        msg.set_content(f"You received a new message from your portfolio website.\n\n"
                        f"Name: {name}\n"
                        f"Email: {email}\n\n"
                        f"Message:\n{message}")
        
        msg['Subject'] = f"New Portfolio Contact from {name}"
        msg['From'] = email_user
        msg['To'] = email_receiver
        
        # Send the message via SMTP server
        with smtplib.SMTP(email_host, email_port) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(msg)
            
        print(f"Email notification sent to {email_receiver}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Route to serve the main HTML page
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# API Route to handle contact form submissions
@app.route('/api/contact', methods=['POST'])
def handle_contact():
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()
    
    if not all([name, email, message]):
        return jsonify({"error": "Name, email, and message are required"}), 400
        
    try:
        # Save to database
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
            (name, email, message)
        )
        conn.commit()
        conn.close()
        
        # Try to send email
        email_sent = send_email_notification(name, email, message)
        
        return jsonify({
            "success": True, 
            "message": "Message saved successfully",
            "email_sent": email_sent
        }), 201
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Internal server error"}), 500

# API Route to handle review form submissions
@app.route('/api/review', methods=['POST'])
def handle_review():
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()
    
    if not all([name, email, message]):
        return jsonify({"error": "Name, email, and review text are required"}), 400
        
    try:
        # Format specifically for reviews
        review_message = f"--- WEBSITE REVIEW ---\n\n{message}"
        
        # Save to database
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
            (name, email, review_message)
        )
        conn.commit()
        conn.close()
        
        # Try to send email
        email_sent = send_email_notification(name, email, review_message)
        
        return jsonify({
            "success": True, 
            "message": "Review submitted successfully! Thank you.",
            "email_sent": email_sent
        }), 201
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Simple admin endpoint to view messages (for local testing only)
@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, message, timestamp FROM messages ORDER BY timestamp DESC')
        rows = cursor.fetchall()
        conn.close()
        
        messages = [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "message": row[3],
                "timestamp": row[4]
            }
            for row in rows
        ]
        
        return jsonify({"messages": messages}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize DB before running
    init_db()
    print("Database initialized.")
    # Run the Flask app on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
