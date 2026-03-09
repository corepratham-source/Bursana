import cv2
import numpy as np
import sys
import json
import requests
from sklearn.cluster import KMeans
from io import BytesIO

TARGET_SIZE = (300, 300)

COLOR_MAP = {
    "red":     np.array([255, 0, 0]),
    "green":   np.array([0, 255, 0]),
    "blue":    np.array([0, 0, 255]),
    "yellow":  np.array([255, 255, 0]),
    "orange":  np.array([255, 165, 0]),
    "purple":  np.array([128, 0, 128]),
    "pink":    np.array([255, 192, 203]),
    "brown":   np.array([165, 42, 42]),
    "black":   np.array([0, 0, 0]),
    "white":   np.array([255, 255, 255]),
}

def closest_color(rgb):
    min_dist = float("inf")
    best_color = "unknown"
    for color, value in COLOR_MAP.items():
        dist = np.linalg.norm(rgb - value)
        if dist < min_dist:
            min_dist = dist
            best_color = color
    return best_color

def dominant_color(image):
    pixels = image.reshape((-1, 3))
    kmeans = KMeans(n_clusters=1, n_init=10)
    kmeans.fit(pixels)
    return kmeans.cluster_centers_[0]

def load_image_from_url(url):
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    image_bytes = np.asarray(bytearray(response.content), dtype=np.uint8)
    image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Unable to decode image")

    return image

def process_image_from_url(image_url):
    image = load_image_from_url(image_url)

    # Resize (in memory)
    resized = cv2.resize(image, TARGET_SIZE)

    # Convert to RGB
    rgb_image = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    # Analyze dominant color
    dom_color = dominant_color(rgb_image)
    color_name = closest_color(dom_color.astype(int))

    return {
        "image_url": image_url,
        "dominant_rgb": dom_color.astype(int).tolist(),
        "category": color_name
    }