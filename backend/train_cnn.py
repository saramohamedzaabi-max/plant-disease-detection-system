import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json
import os

# =====================
# CONFIGURATION
# =====================
DATASET_DIR = "dataset/PlantVillage/color"
IMG_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS = 10   # we will increase later
MODEL_SAVE_PATH = "models/plant_disease_model.h5"
CLASS_INDEX_PATH = "models/class_indices.json"

# =====================
# DATA GENERATORS
# =====================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training"
)

val_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation"
)

# =====================
# BUILD CNN MODEL
# =====================
model = Sequential([
    Conv2D(32, (3,3), activation="relu", input_shape=(128,128,3)),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Conv2D(128, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Flatten(),
    Dense(128, activation="relu"),
    Dropout(0.5),
    Dense(train_generator.num_classes, activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =====================
# TRAIN MODEL
# =====================
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS
)

# =====================
# SAVE MODEL & LABELS
# =====================
os.makedirs("models", exist_ok=True)

model.save(MODEL_SAVE_PATH)

with open(CLASS_INDEX_PATH, "w") as f:
    json.dump(train_generator.class_indices, f)

print("✅ Model and class indices saved successfully!")
