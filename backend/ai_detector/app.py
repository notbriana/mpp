from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import IsolationForest

app = Flask(__name__)

# Train a small model on synthetic "normal" patterns at startup.
rng = np.random.RandomState(0)
X_normal = np.column_stack([
    rng.poisson(5, 2000),            # reqCount
    np.abs(rng.normal(200, 80, 2000)),# avgIatMs
    rng.poisson(1, 2000),            # failedAuth
    rng.poisson(3, 2000),            # uniquePaths
    rng.random(2000)                 # postRatio
])
clf = IsolationForest(contamination=0.02, behaviour='deprecated', random_state=0) if False else IsolationForest(contamination=0.02, random_state=0)
clf.fit(X_normal)

def features_to_array(f):
    return np.array([[
        float(f.get('reqCount', 0)),
        float(f.get('avgIatMs', 0)),
        float(f.get('failedAuth', 0)),
        float(f.get('uniquePaths', 0)),
        float(f.get('postRatio', 0.0))
    ]])

@app.route('/predict', methods=['POST'])
def predict():
    j = request.get_json(force=True)
    f = j.get('features', {})
    X = features_to_array(f)
    try:
        score = float(clf.decision_function(X)[0])
        is_outlier = int(clf.predict(X)[0]) == -1
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    # map decision_function (where higher = normal) to anomaly 0..1
    # crude mapping using a heuristic range
    mapped = max(0.0, min(1.0, 1.0 - ((score + 0.5) / (1.5))))
    return jsonify({'score': mapped, 'is_anomaly': bool(is_outlier)})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
