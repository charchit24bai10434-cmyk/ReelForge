from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from routes.generate_routes import generate_bp
from routes.utility_routes import utility_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Rate limiting — protects your NVIDIA API from abuse
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "20 per hour"],
    storage_uri="memory://"
)

# Apply stricter limits to expensive AI endpoints
limiter.limit("10 per minute")(generate_bp)
limiter.limit("20 per minute")(utility_bp)

app.register_blueprint(generate_bp)
app.register_blueprint(utility_bp)


@app.route('/')
def home():
    return jsonify({
        'message': 'ReelForge Running'
    })


@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({
        "error": "Too many requests. Please wait a moment and try again."
    }), 429


if __name__ == '__main__':
    app.run(debug=True, port=5000)