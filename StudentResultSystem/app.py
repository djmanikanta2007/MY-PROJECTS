from flask import Flask, render_template, request, redirect
import sqlite3
import json

app = Flask(__name__)

admin_user = "admin"
admin_pass = "1234"

def get_db():
    conn = sqlite3.connect("students.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/')
def login_page():
    return render_template("login.html")


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if username == admin_user and password == admin_pass:
        return redirect("/dashboard")
    else:
        return "Invalid Login"


@app.route('/dashboard')
def dashboard():

    conn = get_db()
    students = conn.execute("SELECT * FROM students").fetchall()
    conn.close()

    return render_template("dashboard.html", students=students)


@app.route('/add', methods=['POST'])
def add_student():
    try:
        name = request.form['name']
        roll = request.form['roll']
        scores_list = request.form.getlist('subject[]')
        
        # Convert strings to integers
        scores_int = [int(score) for score in scores_list if score.strip()]
        
        if not scores_int:
            raise ValueError("No subjects provided.")
            
        total = sum(scores_int)
        percentage = total / len(scores_int)
        
        scores_json = json.dumps(scores_int)

        if percentage >= 90:
            grade = "A"
        elif percentage >= 75:
            grade = "B"
        elif percentage >= 60:
            grade = "C"
        else:
            grade = "F"

        conn = get_db()
        conn.execute(
            "INSERT INTO students VALUES (?,?,?,?,?,?)",
            (name, roll, scores_json, total, percentage, grade)
        )
        conn.commit()
        conn.close()

        return redirect("/dashboard")
    except Exception as e:
        conn = get_db()
        students = conn.execute("SELECT * FROM students").fetchall()
        conn.close()
        return render_template("dashboard.html", students=students, error="Error adding student. Please ensure the roll number is unique.")

@app.route('/delete/<roll>')
def delete_student(roll):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE roll=?", (roll,))
    conn.commit()
    conn.close()
    return redirect("/dashboard")


if __name__ == "__main__":
    app.run(debug=True)