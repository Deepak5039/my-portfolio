from flask import Flask, render_template, request, flash, redirect, url_for
import json, os

app = Flask(__name__)
app.config.from_object('config.Config')

DATA_FILE = 'data/messages.json'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']

        new_message = {"name": name, "email": email, "message": message}

        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'w') as f:
                json.dump([], f)

        with open(DATA_FILE, 'r+') as f:
            data = json.load(f)
            data.append(new_message)
            f.seek(0)
            json.dump(data, f, indent=4)

        flash('Thank you for your message! I’ll get back to you soon.', 'success')
        return redirect(url_for('contact'))

    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)
