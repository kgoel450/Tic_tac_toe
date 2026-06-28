"""
Step 2: Train a small neural network on the tic-tac-toe dataset and
export its learned weights to JSON for use in the browser later.
"""

import json
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

with open("tictactoe_dataset.json") as f:
    data = json.load(f)

X = np.array([d["board"] + [d["player"]] for d in data], dtype=np.float32)
y = np.array([d["label"] for d in data], dtype=np.int64)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)

clf = MLPClassifier(
    hidden_layer_sizes=(24,),
    activation="relu",
    max_iter=2000,
    random_state=42,
    alpha=1e-4,
)
clf.fit(X_train, y_train)

train_acc = clf.score(X_train, y_train)
test_acc = clf.score(X_test, y_test)

print(f"Train accuracy: {train_acc:.4f}")
print(f"Test accuracy:  {test_acc:.4f}")

W1, W2 = clf.coefs_
b1, b2 = clf.intercepts_

export = {
    "W1": W1.tolist(),
    "b1": b1.tolist(),
    "W2": W2.tolist(),
    "b2": b2.tolist(),
    "meta": {
        "train_accuracy": round(float(train_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "hidden_units": 24,
    },
}

with open("model_weights.json", "w") as f:
    json.dump(export, f)

print("Saved model_weights.json")