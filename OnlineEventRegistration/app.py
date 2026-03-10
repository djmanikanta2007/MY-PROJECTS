from flask import Flask, render_template, request, redirect, send_file
import sqlite3
import pandas as pd

app = Flask(__name__)

# Admin login credentials
admin_user = "admin"
admin_pass = "1234"


def get_db():
    conn = sqlite3.connect("events.db")
    conn.row_factory = sqlite3.Row
    return conn


# Home page
@app.route('/')
def home():
    return render_template("index.html")


# Registration page
@app.route('/register')
def register():
    return render_template("register.html")


# Submit registration
@app.route('/submit', methods=['POST'])
def submit():

    name = request.form['name']
    email = request.form['email']
    phone = request.form['phone']
    event = request.form['event']

    conn = get_db()

    conn.execute(
        "INSERT INTO participants (name,email,phone,event) VALUES (?,?,?,?)",
        (name, email, phone, event)
    )

    conn.commit()
    conn.close()

    return redirect("/dashboard")


# Admin login
@app.route('/login', methods=['POST'])
def login():

    username = request.form['username']
    password = request.form['password']

    if username == admin_user and password == admin_pass:
        return redirect('/dashboard')
    else:
        return "Invalid Login"


# Dashboard
@app.route('/dashboard')
def dashboard():

    conn = get_db()
    participants = conn.execute("SELECT * FROM participants").fetchall()
    conn.close()

    return render_template("dashboard.html", participants=participants)


# Search participant
@app.route('/search', methods=['POST'])
def search():

    keyword = request.form['keyword']

    conn = get_db()

    participants = conn.execute(
        "SELECT * FROM participants WHERE name LIKE ?",
        ('%' + keyword + '%',)
    ).fetchall()

    conn.close()

    return render_template("dashboard.html", participants=participants)


# Delete participant
@app.route('/delete/<int:id>')
def delete(id):

    conn = get_db()

    conn.execute("DELETE FROM participants WHERE id=?", (id,))

    conn.commit()
    conn.close()

    return redirect("/dashboard")


# Export CSV
@app.route('/export')
def export():

    conn = get_db()
    data = conn.execute("SELECT * FROM participants").fetchall()
    conn.close()

    rows = [dict(row) for row in data]

    import pandas as pd
    from io import StringIO
    from flask import Response

    df = pd.DataFrame(rows)

    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)

    csv_buffer.seek(0)

    return Response(
        csv_buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=participants.csv"}
    )

if __name__ == "__main__":
    app.run(debug=True)