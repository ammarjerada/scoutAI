from flask import Blueprint, request, jsonify
from services.style_predictor import predict_style

players_bp = Blueprint("players", __name__)

@players_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        style = predict_style(data)
        return jsonify({"style": style})
    except Exception as e:
        return jsonify({"error": str(e)}), 400