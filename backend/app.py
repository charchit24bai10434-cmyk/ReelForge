from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from routes.generate_routes import generate_bp
from routes.utility_routes import utility_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "10 per minute"]
)

app.register_blueprint(generate_bp)
app.register_blueprint(utility_bp)


@app.route('/')
def home():
    return jsonify({
        'message': 'ReelForge Running'
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)