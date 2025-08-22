from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import pandas as pd
import os

# Initialize Flask
app = Flask(__name__, template_folder="../templates", static_folder="../static")
CORS(app)

# Load the trained pipeline (preprocessing + model)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/stroke_best.pkl")
model = joblib.load(MODEL_PATH)

# Risk tiering helper
def risk_tier(p: float):
    if p < 0.33:
        return "Low"
    elif p < 0.66:
        return "Moderate"
    return "High"

@app.route("/")
def home():
    # Render simple UI
    return render_template("index.html")

@app.post("/predict/stroke")
def predict_stroke():
    """
    Expects JSON body with the following keys:
    {
        "gender": "Male"|"Female"|"Other",
        "age": 67,
        "hypertension": 0|1,
        "heart_disease": 0|1,
        "ever_married": "Yes"|"No",
        "work_type": "Private"|"Self-employed"|"Govt_job"|"children"|"Never_worked",
        "Residence_type": "Urban"|"Rural",
        "avg_glucose_level": 228.69,
        "bmi": 36.6,
        "smoking_status": "formerly smoked"|"never smoked"|"smokes"|"Unknown"
    }
    """
    try:
        payload = request.get_json(force=True)
        # Convert to DataFrame with one row; column names must match training
        X = pd.DataFrame([payload])
        proba = float(model.predict_proba(X)[0, 1])
        pred = int(proba >= 0.5)

        return jsonify({
            "prediction": pred,
            "probability": proba,
            "risk": risk_tier(proba)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    # Run on http://127.0.0.1:5000/
    app.run(debug=True)
