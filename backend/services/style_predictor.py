import joblib
import pandas as pd

MODEL_PATH = "model/scoutAI_model.joblib"
FEATURES = ['Gls', 'Ast', 'xG', 'xAG', 'Tkl', 'PrgP', 'Carries', 'KP']

model = joblib.load(MODEL_PATH)

def predict_style(player_stats):
    df = pd.DataFrame([player_stats])
    df = df[FEATURES].fillna(0)
    prediction = model.predict(df)
    return prediction[0]
