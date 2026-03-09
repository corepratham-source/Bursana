const axios = require("axios");
const sharp = require("sharp");

/* ================= CONSTANTS ================= */

const TARGET_SIZE = { width: 300, height: 300 };

const COLOR_MAP = {
  red:     [255, 0, 0],
  green:   [0, 255, 0],
  blue:    [0, 0, 255],
  yellow:  [255, 255, 0],
  orange:  [255, 165, 0],
  purple:  [128, 0, 128],
  pink:    [255, 192, 203],
  brown:   [165, 42, 42],
  black:   [0, 0, 0],
  white:   [255, 255, 255],
};

/* ================= KMEANS (DYNAMIC IMPORT) ================= */

// Cached kmeans reference
let kmeansFn = null;

async function getKMeans() {
  try {
    if (!kmeansFn) {
      const mod = await import("ml-kmeans");
      kmeansFn = mod.kmeans;
    }
    return kmeansFn;
  }catch (e) {
    console.error("KMeans load failed:", e);
    return null;
  }
}

/* ================= HELPERS ================= */

function euclideanDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

function closestColor(rgb) {
  let minDist = Infinity;
  let bestColor = "unknown";

  for (const [color, value] of Object.entries(COLOR_MAP)) {
    const dist = euclideanDistance(rgb, value);
    if (dist < minDist) {
      minDist = dist;
      bestColor = color;
    }
  }

  return bestColor;
}

/* ================= IMAGE FUNCTIONS ================= */

async function loadImageFromUrl(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 10000,
  });
  return response.data;
}

async function dominantColor(imageBuffer) {
  try {
    const { data } = await sharp(imageBuffer)
      .resize(TARGET_SIZE.width, TARGET_SIZE.height)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    for (let i = 0; i < data.length; i += 3) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    const kmeans = await getKMeans();
    const result = kmeans(pixels, 1);

    const centroid =
      Array.isArray(result.centroids?.[0])
        ? result.centroids[0]
        : result.centroids?.[0]?.centroid;

    if (!centroid) throw new Error("No centroid");

    return centroid.map(v => Math.round(v));
  } catch (err) {
    console.error("dominantColor failed:", err);
    return [128, 128, 128]; // neutral fallback
  }
}


/* ================= PUBLIC API ================= */

async function processImageFromUrl(imageUrl) {
  if (!imageUrl) {
    throw new Error("Image URL not provided");
  }

  const imageBuffer = await loadImageFromUrl(imageUrl);
  const domColor = await dominantColor(imageBuffer);
  const colorName = closestColor(domColor);

  return {
    image_url: imageUrl,
    dominant_rgb: domColor,
    category: colorName,
  };
}

module.exports = { processImageFromUrl };
