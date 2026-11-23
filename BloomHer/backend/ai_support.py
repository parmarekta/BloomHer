"""Explainable, non-clinical support-topic classifier for BloomHer.

This model routes a mother's voluntarily entered support request to an
educational resource topic. It does NOT assess symptoms, diagnose, predict
mental illness, or determine urgency. Training phrases are illustrative
synthetic examples and must not be presented as participant data.
"""
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

TRAINING_EXAMPLES = {
    "sleep_rest": [
        "I cannot sleep because the baby wakes up at night",
        "I feel exhausted and need help getting enough rest",
        "How can my family help me rest after delivery",
        "I wake up many times and feel tired all day",
        "I need advice about sleep and recovery after birth",
        "I am finding it hard to get rest during pregnancy",
        "My newborn keeps me awake and I need rest tips",
        "I am not getting enough hours of sleep",
        "How can I take short breaks and recover my energy",
        "I feel physically tired from night feeds",
        "Please suggest healthy rest routines for new mothers",
        "I need help planning sleep while caring for my infant",
        "I want information about postpartum recovery and rest",
        "I am struggling to relax and sleep at night",
        "My family can help but we need a better rest schedule",
    ],
    "feeding_support": [
        "I need help with breastfeeding and feeding my baby",
        "I have questions about feeding after delivery",
        "Please share information about infant feeding support",
        "I am worried about feeding my newborn",
        "I need guidance about breastfeeding difficulties",
        "Where can I get help with feeding my baby",
        "I want to learn about feeding positions for my infant",
        "I have questions about expressing and storing breast milk",
        "Please connect me with someone who can explain baby feeding",
        "I need information about newborn feeding routines",
        "I am having trouble latching my baby during feeds",
        "Can I get advice about feeding my child safely",
        "I want support with breastfeeding challenges",
        "I need to understand how often a newborn should feed",
        "Please share infant nutrition and feeding resources",
    ],
    "family_support": [
        "I need my partner and family to help me more",
        "How can I talk to my family about sharing baby care",
        "I feel alone and want community support",
        "I would like an ASHA home visit and family discussion",
        "I need help asking relatives for support",
        "Can someone connect me with a local mothers group",
        "My family does not understand how much help I need",
        "I want to meet other mothers in my village",
        "How do I ask my partner to share household tasks",
        "I need community services for mothers and families",
        "Can an ASHA worker visit and speak with my family",
        "I want to know about local parent support groups",
        "My relatives could help with childcare if I ask",
        "I need practical support from people around me",
        "Please tell me how to find a mothers support group",
    ],
    "emotional_wellbeing": [
        "I want to talk about feeling overwhelmed and worried",
        "I have been feeling low and need someone to listen",
        "I would like information about emotional wellbeing",
        "I feel anxious and want to speak with a support worker",
        "I need a safe conversation about my feelings",
        "I have been tearful and would like supportive resources",
        "I feel stressed and want general emotional support information",
        "I want to learn ways to talk about my feelings",
        "Some days feel difficult and I need someone to hear me",
        "I would like a supportive conversation about my mood",
        "I feel overwhelmed by changes and want wellbeing resources",
        "I need information about coping with emotional changes",
        "I want to speak to someone in a supportive setting",
        "Please suggest resources about maternal emotional wellbeing",
        "I have worries and would like a non judgmental conversation",
    ],
    "professional_guidance": [
        "I would like to speak with a doctor or counsellor",
        "Please help me arrange a healthcare professional appointment",
        "I want to discuss my concerns with a clinician",
        "Where can I get professional maternal health support",
        "I would like a referral for a clinical conversation",
        "Can the health centre arrange an appointment for me",
        "I want to book a visit with a qualified healthcare provider",
        "Please connect me with a medical professional",
        "I need an appointment at the clinic to discuss my concerns",
        "How can I contact a counsellor through the health centre",
        "I want professional advice from a doctor",
        "Can I be referred to a specialist for a consultation",
        "I would like to arrange a clinician follow up",
        "Please help me find a qualified health professional",
        "I want to discuss my wellbeing with a trained clinician",
    ],
}

RESOURCE_MAP = {
    "sleep_rest": {
        "title": "Finding rest in the fourth trimester",
        "topic": "Sleep and recovery",
        "resource_id": "res-1",
    },
    "feeding_support": {
        "title": "Feeding, mood, and asking for help",
        "topic": "Postpartum",
        "resource_id": "res-4",
    },
    "family_support": {
        "title": "Talking with your ASHA worker",
        "topic": "Community support",
        "resource_id": "res-2",
    },
    "emotional_wellbeing": {
        "title": "Talking with your ASHA worker",
        "topic": "Community support",
        "resource_id": "res-2",
    },
    "professional_guidance": {
        "title": "When to speak with a clinician",
        "topic": "Care pathways",
        "resource_id": "res-3",
    },
}


@lru_cache(maxsize=1)
def _model() -> Pipeline:
    texts: list[str] = []
    labels: list[str] = []
    for label, examples in TRAINING_EXAMPLES.items():
        texts.extend(examples)
        labels.extend([label] * len(examples))

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
        ]
    )
    pipeline.fit(texts, labels)
    return pipeline


def classify_support_topic(message: str) -> dict:
    cleaned = " ".join(message.split())
    if len(cleaned) < 8:
        raise ValueError("Please enter a little more detail (at least 8 characters).")
    if len(cleaned) > 1000:
        raise ValueError("Please keep the message under 1,000 characters.")

    model = _model()
    probabilities = model.predict_proba([cleaned])[0]
    classes = model.named_steps["classifier"].classes_
    best_index = int(probabilities.argmax())
    topic = str(classes[best_index])
    confidence = float(probabilities[best_index])

    # Low-confidence input is deliberately not forced into a category.
    if confidence < 0.24:
        return {
            "matched": False,
            "message": "We could not confidently match that request. Please choose a resource or speak with your ASHA worker.",
            "disclaimer": "This feature only sorts resource topics. It does not assess health or urgency.",
        }

    resource = RESOURCE_MAP[topic]
    return {
        "matched": True,
        "topic": topic,
        "confidence": round(confidence, 3),
        "resource": resource,
        "disclaimer": "AI suggestion based on the words you entered. It is not a clinical assessment, diagnosis, or emergency service.",
    }
