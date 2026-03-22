from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os
import matplotlib
matplotlib.use("Agg")   
import matplotlib.pyplot as plt
import seaborn as sns
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sklearn.metrics import confusion_matrix
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from reportlab.lib.utils import ImageReader

app = Flask(__name__)
CORS(app)

MODEL_PATH = "models/plant_disease_model.h5"
CLASS_INDEX_PATH = "models/class_indices.json"
IMG_SIZE = (128, 128)

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_INDEX_PATH, "r") as f:
    class_indices = json.load(f)

class_names = {v: k for k, v in class_indices.items()}
# =====================
# DASHBOARD CACHE
# =====================

DATASET_PATH = "dataset/PlantVillage/color"
cached_confusion_matrix = None
cached_accuracy = None
prediction_log = []

cached_labels = None


# =====================
# SEVERITY MAP
# =====================
severity_map = {
    "Apple___Apple_scab": "Moderate",
    "Apple___Black_rot": "High",
    "Apple___Cedar_apple_rust": "Moderate",
    "Apple___healthy": "None",

    "Blueberry___healthy": "None",

    "Cherry_(including_sour)___Powdery_mildew": "Moderate",
    "Cherry_(including_sour)___healthy": "None",

    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Moderate",
    "Corn_(maize)___Common_rust_": "Moderate",
    "Corn_(maize)___Northern_Leaf_Blight": "High",
    "Corn_(maize)___healthy": "None",

    "Grape___Black_rot": "High",
    "Grape___Esca_(Black_Measles)": "High",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Moderate",
    "Grape___healthy": "None",

    "Orange___Haunglongbing_(Citrus_greening)": "High",

    "Peach___Bacterial_spot": "Moderate",
    "Peach___healthy": "None",

    "Pepper,_bell___Bacterial_spot": "Moderate",
    "Pepper,_bell___healthy": "None",

    "Potato___Early_blight": "Moderate",
    "Potato___Late_blight": "High",
    "Potato___healthy": "None",

    "Raspberry___healthy": "None",
    "Soybean___healthy": "None",

    "Squash___Powdery_mildew": "Moderate",

    "Strawberry___Leaf_scorch": "Moderate",
    "Strawberry___healthy": "None",

    "Tomato___Bacterial_spot": "Moderate",
    "Tomato___Early_blight": "Moderate",
    "Tomato___Late_blight": "High",
    "Tomato___Leaf_Mold": "Moderate",
    "Tomato___Septoria_leaf_spot": "Moderate",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Moderate",
    "Tomato___Target_Spot": "Moderate",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "High",
    "Tomato___Tomato_mosaic_virus": "High",
    "Tomato___healthy": "None",
}

# =====================
# EXPERT ADVICE (EXTENDED & FORMAL)
# =====================
expert_advice = {

# ---------------- APPLE ----------------

"Apple___Apple_scab":
"Apple scab is a fungal disease caused by the pathogen Venturia inaequalis. The fungus overwinters in fallen leaves and spreads during cool, wet spring conditions through rain splash and wind. It first appears as olive-green lesions on leaves and fruit, which may later become dark and scabby. To treat this disease, remove and destroy infected leaves and fruit to reduce spore sources, and apply recommended fungicides during early bud development stages. Preventive measures include maintaining proper tree spacing, improving air circulation through pruning, and selecting resistant apple varieties to reduce long-term infection risk.",

"Apple___Black_rot":
"Black rot is a serious fungal infection caused by Botryosphaeria obtusa that affects apple leaves, fruit, and bark. The disease develops in warm and humid environments and spreads through spores produced on infected plant debris. Symptoms include circular purple leaf spots and fruit rot. Treatment requires immediate removal of infected fruit and pruning of diseased branches to limit fungal spread. Preventive management includes orchard sanitation, avoiding tree stress, and applying protective fungicides during the growing season to reduce recurrence.",

"Apple___Cedar_apple_rust":
"Cedar apple rust is caused by fungi in the genus Gymnosporangium and requires both apple trees and nearby juniper plants to complete its life cycle. The disease produces bright orange leaf spots and can reduce fruit quality. Treatment includes applying fungicides during the pink bud stage and removing nearby juniper hosts when possible. Long-term prevention involves planting resistant cultivars, improving orchard ventilation, and monitoring environmental conditions that favor fungal development.",

"Apple___healthy":
"The apple plant appears healthy with no visible signs of fungal or bacterial infection. To maintain this condition, ensure balanced fertilization, adequate irrigation, regular pruning to improve airflow, and proper orchard sanitation. Continuous monitoring and early detection are essential for preventing disease establishment.",

# ---------------- BLUEBERRY ----------------

"Blueberry___healthy":
"The blueberry plant shows no visible disease symptoms. Maintaining healthy growth requires acidic soil conditions, proper drainage, routine pruning to enhance airflow, and consistent monitoring for early disease signs. Preventive care is the best strategy to avoid fungal and bacterial infections.",

# ---------------- CHERRY ----------------

"Cherry_(including_sour)___Powdery_mildew":
"Powdery mildew in cherry trees is caused by fungal pathogens that thrive in humid environments with moderate temperatures. It appears as white powdery growth on leaves and young shoots, reducing photosynthesis and weakening the plant. Treatment involves applying sulfur-based fungicides and pruning affected branches. Prevention includes ensuring adequate spacing between trees, avoiding excessive nitrogen fertilization, and maintaining good air circulation to limit fungal growth.",

"Cherry_(including_sour)___healthy":
"The cherry plant appears healthy without signs of infection. Continue routine inspection, balanced irrigation, and seasonal pruning to prevent disease development and ensure long-term productivity.",

# ---------------- CORN ----------------

"Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot":
"Gray leaf spot is caused by the fungus Cercospora zeae-maydis and is common in warm, humid regions. It produces rectangular gray lesions that reduce photosynthetic activity and crop yield. Treatment may involve fungicide application when disease severity is high. Preventive measures include crop rotation, residue management, and planting resistant hybrids to reduce fungal survival in the field.",

"Corn_(maize)___Common_rust_":
"Common rust is a fungal disease caused by Puccinia sorghi. It spreads through airborne spores and produces reddish-brown pustules on corn leaves. While mild infections may not require intervention, severe outbreaks can reduce yield. Treatment includes fungicide application when necessary. Prevention focuses on using resistant hybrids and monitoring environmental conditions conducive to rust development.",

"Corn_(maize)___Northern_Leaf_Blight":
"Northern leaf blight is caused by the fungus Exserohilum turcicum and develops in humid conditions. It produces long, cigar-shaped lesions that reduce leaf function. Treatment involves fungicide use during early infection stages. Preventive strategies include crop rotation, residue management, and selecting resistant corn varieties to minimize disease pressure.",

"Corn_(maize)___healthy":
"The corn plant appears healthy. Maintain appropriate fertilization, irrigation scheduling, and routine field scouting to detect potential issues early and preserve plant health.",

# ---------------- GRAPE ----------------

"Grape___Black_rot":
"Black rot in grapes is caused by the fungus Guignardia bidwellii and spreads during wet weather. It causes brown leaf spots and shriveled fruit clusters. Treatment includes removal of infected clusters and early-season fungicide applications. Preventive management involves vineyard sanitation, proper canopy management, and minimizing prolonged leaf wetness.",

"Grape___Esca_(Black_Measles)":
"Esca is a complex trunk disease affecting grapevines and is associated with multiple fungal pathogens. It leads to leaf discoloration and vine decline. Treatment options are limited, but infected wood should be pruned and destroyed. Prevention includes avoiding pruning during wet conditions and protecting pruning wounds to reduce pathogen entry.",

"Grape___Leaf_blight_(Isariopsis_Leaf_Spot)":
"Grape leaf blight is a fungal infection that causes irregular brown lesions on leaves. It develops in humid climates and can reduce plant vigor. Treatment includes fungicide application and removal of infected debris. Prevention relies on maintaining proper vine spacing and improving airflow within the canopy.",

"Grape___healthy":
"The grapevine appears healthy. Maintain proper irrigation practices, balanced nutrition, and regular vineyard sanitation to prevent fungal establishment.",

# ---------------- ORANGE ----------------

"Orange___Haunglongbing_(Citrus_greening)":
"Citrus greening, also known as Huanglongbing, is a severe bacterial disease spread by psyllid insects. It causes yellowing leaves, misshapen fruit, and tree decline. There is no effective cure; infected trees must be removed to prevent spread. Prevention includes controlling insect vectors, planting certified disease-free stock, and monitoring orchards regularly.",

# ---------------- PEACH ----------------

"Peach___Bacterial_spot":
"Bacterial spot is caused by Xanthomonas campestris and affects peach leaves and fruit. It appears as dark lesions that may lead to defoliation. Treatment involves applying copper-based bactericides. Prevention includes avoiding overhead irrigation, ensuring proper spacing, and using resistant varieties.",

"Peach___healthy":
"The peach plant appears healthy. Maintain orchard hygiene and monitor regularly for early signs of bacterial or fungal infection.",

# ---------------- PEPPER ----------------

"Pepper,_bell___Bacterial_spot":
"Bacterial spot in bell peppers is caused by Xanthomonas species and results in water-soaked lesions that darken over time. Treatment includes applying copper sprays and removing infected plant material. Prevention requires using certified seeds, crop rotation, and minimizing leaf wetness.",

"Pepper,_bell___healthy":
"The bell pepper plant is healthy. Continue preventive care through proper irrigation management and regular inspection.",

# ---------------- POTATO ----------------

"Potato___Early_blight":
"Early blight is caused by Alternaria solani and produces concentric ring lesions on leaves. It spreads in warm conditions. Treatment involves applying fungicides early and removing infected foliage. Prevention includes crop rotation and avoiding plant stress.",

"Potato___Late_blight":
"Late blight is caused by Phytophthora infestans and is highly destructive under cool, wet conditions. It spreads rapidly and can destroy entire crops. Treatment requires immediate removal of infected plants and protective fungicide application. Prevention includes resistant varieties and careful irrigation management.",

"Potato___healthy":
"The potato plant appears healthy. Practice crop rotation and regular monitoring to maintain disease-free growth.",

# ---------------- RASPBERRY ----------------

"Raspberry___healthy":
"The raspberry plant shows no disease symptoms. Maintain pruning practices, proper spacing, and consistent inspection to prevent fungal infection.",

# ---------------- SOYBEAN ----------------

"Soybean___healthy":
"The soybean crop appears healthy. Ensure balanced nutrient management and monitor fields regularly to maintain optimal productivity.",

# ---------------- SQUASH ----------------

"Squash___Powdery_mildew":
"Powdery mildew in squash is a fungal disease that produces white powder-like patches on leaves. It thrives in warm, dry climates with high humidity at night. Treatment involves fungicide application and removing infected leaves. Prevention includes improving airflow and selecting resistant varieties.",

# ---------------- STRAWBERRY ----------------

"Strawberry___Leaf_scorch":
"Leaf scorch is caused by fungal pathogens that produce purple-brown lesions on strawberry leaves. It reduces plant vigor if left unmanaged. Treatment includes removing infected foliage and applying fungicides. Prevention focuses on improving air circulation and avoiding excessive moisture.",

"Strawberry___healthy":
"The strawberry plant appears healthy. Continue maintaining proper irrigation, spacing, and field sanitation practices.",

# ---------------- TOMATO ----------------

"Tomato___Bacterial_spot":
"Bacterial spot in tomatoes is caused by Xanthomonas species and leads to dark lesions on leaves and fruit. Treatment includes copper-based sprays and removal of infected plant debris. Prevention requires using certified seeds and avoiding handling plants when wet.",

"Tomato___Early_blight":
"Early blight is caused by Alternaria solani and produces concentric ring lesions on older leaves. Treatment involves timely fungicide applications and removal of infected foliage. Prevention includes crop rotation and proper plant spacing.",

"Tomato___Late_blight":
"Late blight is caused by Phytophthora infestans and spreads rapidly in cool, wet weather. It causes leaf collapse and fruit rot. Treatment requires immediate removal of infected plants and fungicide application. Prevention includes resistant varieties and reducing leaf wetness.",

"Tomato___Leaf_Mold":
"Leaf mold is caused by Passalora fulva and appears as yellow spots on the upper leaf surface with mold underneath. Treatment involves improving ventilation and applying fungicides. Prevention includes controlling humidity levels in growing environments.",

"Tomato___Septoria_leaf_spot":
"Septoria leaf spot is a fungal disease that produces small circular lesions with dark margins. Treatment includes removing lower infected leaves and applying fungicides. Prevention requires good air circulation and sanitation.",

"Tomato___Spider_mites Two-spotted_spider_mite":
"Two-spotted spider mites are pests rather than pathogens. They cause yellow speckling and fine webbing on leaves. Treatment includes insecticidal soap and miticides. Prevention involves maintaining adequate humidity and avoiding plant stress.",

"Tomato___Target_Spot":
"Target spot is a fungal disease producing dark concentric lesions on tomato leaves. Treatment involves fungicide use and removal of infected tissue. Prevention includes crop rotation and improved airflow.",

"Tomato___Tomato_Yellow_Leaf_Curl_Virus":
"Tomato yellow leaf curl virus is transmitted by whiteflies and causes leaf curling and stunted growth. There is no cure; infected plants must be removed. Prevention focuses on controlling whitefly populations and using resistant varieties.",

"Tomato___Tomato_mosaic_virus":
"Tomato mosaic virus causes mottled leaves and distortion. It spreads through contaminated tools and plant contact. There is no chemical cure; infected plants should be removed. Prevention includes disinfecting tools and using certified disease-free seeds.",

"Tomato___healthy":
"The tomato plant appears healthy. Continue proper irrigation, fertilization, and regular inspection to maintain disease-free growth."
}

# =====================
# HEALTHY IMAGE MAP
# =====================
healthy_map = {
    "Apple": "apple.jpg",
    "Blueberry": "blueberry.jpg",
    "Cherry_(including_sour)": "cherry.jpg",
    "Corn_(maize)": "corn.jpg",
    "Grape": "grape.jpg",
    "Orange": "orange.jpg",
    "Peach": "peach.jpg",
    "Pepper,_bell": "pepper.jpg",
    "Potato": "potato.jpg",
    "Raspberry": "raspberry.jpg",
    "Soybean": "soybean.jpg",
    "Squash": "squash.jpg",
    "Strawberry": "strawberry.jpg",
    "Tomato": "tomato.jpg",
}
def compute_model_performance():
    global cached_confusion_matrix, cached_accuracy, cached_labels

    print("Computing confusion matrix (only once)...")

    datagen = ImageDataGenerator(rescale=1./255)

    generator = datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=32,
        class_mode="categorical",
        shuffle=False
    )

    predictions = model.predict(generator)
    y_pred = np.argmax(predictions, axis=1)
    y_true = generator.classes

    cm = confusion_matrix(y_true, y_pred)
    accuracy = round(np.sum(y_pred == y_true) / len(y_true) * 100, 2)

    # ---- Top 5 most frequent classes ----
    class_counts = np.bincount(y_true)
    top5_indices = np.argsort(class_counts)[-5:]

    top5_cm = cm[np.ix_(top5_indices, top5_indices)]

    cached_confusion_matrix = top5_cm.tolist()
    cached_labels = [list(generator.class_indices.keys())[i] for i in top5_indices]
    cached_accuracy = accuracy

    print("Top-5 confusion matrix ready.")

def generate_heatmap_image():
    global cached_confusion_matrix, cached_labels

    if cached_confusion_matrix is None or cached_labels is None:
        return None

    fig, ax = plt.subplots(figsize=(6, 5))

    sns.heatmap(
        cached_confusion_matrix,
        annot=True,
        fmt="d",
        cmap="Greens",
        xticklabels=cached_labels,
        yticklabels=cached_labels,
        ax=ax
    )

    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.title("Top-5 Class Confusion Heatmap")
    plt.tight_layout()

    img_buffer = io.BytesIO()
    fig.savefig(img_buffer, format="png")
    plt.close(fig)

    img_buffer.seek(0)
    return img_buffer



@app.route("/healthy_references/<filename>")
def get_healthy_image(filename):
    return send_from_directory("healthy_references", filename)

# =====================
# PREDICT
# =====================
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    img = Image.open(request.files["file"]).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.expand_dims(np.array(img) / 255.0, axis=0)

    preds = model.predict(arr)
    idx = int(np.argmax(preds))

    predicted_key = class_names[idx]
    confidence = round(float(np.max(preds)) * 100, 2)
    
    prediction_log.append({
        "severity": severity_map.get(predicted_key, "Unknown"),
        "confidence": confidence
    })


    

    plant_name = predicted_key.split("___")[0]
    is_healthy = "healthy" in predicted_key.lower()

    # Only send healthy reference if disease is NOT healthy
    healthy_image_url = None
    if not is_healthy:
        filename = healthy_map.get(plant_name)
        if filename:
            healthy_image_url = f"http://localhost:4000/healthy_references/{filename}"

    return jsonify({
        "class_key": predicted_key,
        "class_name": predicted_key.replace("___", " ").replace("_", " "),
        "confidence": confidence,
        "severity": severity_map.get(predicted_key, "Unknown"),
        "advice": expert_advice.get(predicted_key),
        "healthy_image": healthy_image_url
    })
@app.route("/dashboard-data", methods=["GET"])
def dashboard_data():

    severity_distribution = {
        "High": 0,
        "Moderate": 0,
        "None": 0
    }

    for entry in prediction_log:
        sev = entry["severity"]
        if sev in severity_distribution:
            severity_distribution[sev] += 1

    confidence_distribution = {
        "80-85": 0,
        "85-90": 0,
        "90-95": 0,
        "95-100": 0
    }

    for entry in prediction_log:
        conf = entry["confidence"]

        if 80 <= conf < 85:
            confidence_distribution["80-85"] += 1
        elif 85 <= conf < 90:
            confidence_distribution["85-90"] += 1
        elif 90 <= conf < 95:
            confidence_distribution["90-95"] += 1
        elif 95 <= conf <= 100:
            confidence_distribution["95-100"] += 1

    return jsonify({
       "accuracy": cached_accuracy,
       "confusion_matrix": cached_confusion_matrix,
       "labels": cached_labels,
       "severity_distribution": severity_distribution,
       "confidence_distribution": confidence_distribution
    })


# =====================
# PDF GENERATION
# =====================
@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    data = request.get_json()

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 50

    # Title
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(50, y, "Plant Disease Detection Report")
    y -= 40

    pdf.setFont("Helvetica", 12)

    pdf.drawString(50, y, f"Date: {data.get('date')}")
    y -= 20

    pdf.drawString(50, y, f"Disease: {data.get('disease')}")
    y -= 20

    pdf.drawString(50, y, f"Confidence: {data.get('confidence')}%")
    y -= 20

    pdf.drawString(50, y, f"Severity: {data.get('severity')}")
    y -= 30

    # Model Accuracy
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Model Overall Accuracy:")
    y -= 20

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, y, f"{cached_accuracy}%")
    y -= 40

    # Heatmap
    heatmap_img = generate_heatmap_image()
    if heatmap_img:
       heatmap_image_reader = ImageReader(heatmap_img)
       pdf.drawImage(heatmap_image_reader, 50, y - 250, width=450, height=250)
       y -= 280


    # Healthy Reference Image
    healthy_image_url = data.get("healthy_image")

    if healthy_image_url:
        try:
            image_path = healthy_image_url.split("/")[-1]
            local_path = os.path.join("healthy_references", image_path)

            if os.path.exists(local_path):
                healthy_image_reader = ImageReader(local_path)
                pdf.drawImage(healthy_image_reader, 50, y - 150, width=200, height=120)

                y -= 170
        except:
            pass

    # Expert Advice
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Expert Advice:")
    y -= 20

    pdf.setFont("Helvetica", 11)

    text_object = pdf.beginText(50, y)
    text_object.setLeading(15)

    advice = data.get("advice", "")
    words = advice.split()
    line = ""

    for word in words:
        if len(line + word) < 90:
            line += word + " "
        else:
            text_object.textLine(line)
            line = word + " "

    text_object.textLine(line)
    pdf.drawText(text_object)

    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="plant_disease_report.pdf",
        mimetype="application/pdf"
    )



compute_model_performance()

if __name__ == "__main__":
    app.run(debug=True, port=4000)
