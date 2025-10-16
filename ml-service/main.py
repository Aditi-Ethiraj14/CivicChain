from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn

app = FastAPI(title="CivicChain ML Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained MobileNetV2 model
print("Loading MobileNetV2 model...")
model = MobileNetV2(weights='imagenet', include_top=True)
print("Model loaded successfully!")

class VerificationResult(BaseModel):
    ai_verified: bool
    confidence: float
    prediction: str
    category_match: bool
    details: Dict[str, Any]

# Category mapping for civic issues
CIVIC_CATEGORIES = {
    'POTHOLE': ['pothole', 'road', 'asphalt', 'street', 'pavement', 'crack'],
    'GARBAGE': ['garbage', 'trash', 'waste', 'litter', 'bin', 'refuse'],
    'STREETLIGHT': ['streetlight', 'lamp', 'light', 'pole', 'illumination'],
    'FLOOD': ['flood', 'water', 'puddle', 'rain', 'drainage'],
    'TRAFFIC': ['traffic', 'sign', 'signal', 'car', 'vehicle', 'road'],
    'VANDALISM': ['graffiti', 'damage', 'broken', 'vandalism'],
    'OTHER': ['other', 'miscellaneous', 'general']
}

def preprocess_image(img_bytes: bytes) -> np.ndarray:
    """Preprocess image for MobileNetV2"""
    try:
        img = Image.open(io.BytesIO(img_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to 224x224 as required by MobileNetV2
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        return img_array
    except Exception as e:
        raise HTTPException(status_code=400, f"Error processing image: {str(e)}")

def check_category_match(predictions: list, reported_category: str) -> tuple:
    """Check if AI prediction matches the reported category"""
    if reported_category not in CIVIC_CATEGORIES:
        return False, 0.0, "Unknown category"
    
    keywords = CIVIC_CATEGORIES[reported_category]
    
    # Get top 5 predictions
    top_predictions = decode_predictions(predictions, top=5)[0]
    
    max_confidence = 0.0
    best_match = ""
    category_found = False
    
    for pred in top_predictions:
        class_name = pred[1].lower()
        confidence = float(pred[2])
        
        # Check if any keyword matches
        for keyword in keywords:
            if keyword in class_name:
                category_found = True
                if confidence > max_confidence:
                    max_confidence = confidence
                    best_match = pred[1]
                break
    
    return category_found, max_confidence, best_match

@app.post("/verify", response_model=VerificationResult)
async def verify_image(
    image_file: UploadFile = File(...),
    category: str = "OTHER"
):
    """Verify uploaded image against reported category"""
    
    if not image_file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await image_file.read()
        
        # Preprocess
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image)
        
        # Get top prediction
        top_predictions = decode_predictions(predictions, top=3)[0]
        top_prediction = top_predictions[0]
        
        # Check category match
        category_match, match_confidence, best_match = check_category_match(
            predictions, category.upper()
        )
        
        # Determine verification result
        overall_confidence = float(top_prediction[2])
        if category_match and match_confidence > 0.3:
            overall_confidence = match_confidence
        
        ai_verified = category_match and overall_confidence > 0.5
        
        result = VerificationResult(
            ai_verified=ai_verified,
            confidence=round(overall_confidence, 3),
            prediction=best_match if category_match else top_prediction[1],
            category_match=category_match,
            details={
                "reported_category": category,
                "top_predictions": [
                    {
                        "class": pred[1],
                        "confidence": round(float(pred[2]), 3)
                    } for pred in top_predictions
                ],
                "match_confidence": round(match_confidence, 3) if category_match else 0.0,
                "threshold_met": overall_confidence > 0.5
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": "MobileNetV2",
        "version": "1.0.0"
    }

@app.get("/categories")
async def get_categories():
    """Get supported categories"""
    return {
        "categories": list(CIVIC_CATEGORIES.keys()),
        "mappings": CIVIC_CATEGORIES
    }

if __name__ == "__main__":
    print("Starting CivicChain ML Service...")
    print("Access docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)