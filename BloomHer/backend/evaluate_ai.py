"""Small hold-out evaluation for the illustrative resource-topic model.

This is a classroom sanity check on synthetic phrases only, not external or
clinical validation. Run from backend/: python evaluate_ai.py
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ai_support import TRAINING_EXAMPLES

texts, labels = [], []
for label, examples in TRAINING_EXAMPLES.items():
    texts.extend(examples)
    labels.extend([label] * len(examples))

x_train, x_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.25,
    random_state=42,
    stratify=labels,
)

model = Pipeline(
    [
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
        ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
    ]
)
model.fit(x_train, y_train)
predictions = model.predict(x_test)

print(f"Synthetic phrases: {len(texts)}")
print(f"Train rows: {len(x_train)} | Held-out rows: {len(x_test)}")
print("\nClassification report (synthetic hold-out only):")
print(classification_report(y_test, predictions, zero_division=0))
print("Confusion matrix (labels sorted alphabetically):")
print(confusion_matrix(y_test, predictions, labels=sorted(set(labels))))
print("\nDo not describe these metrics as clinical or real-user validation.")
