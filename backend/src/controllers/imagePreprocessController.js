const { processImageFromUrl } = require("../models/image_preprocessJS");

/**
 * Preprocess image using JS pipeline
 * @param {string} imageUrl
 * @returns {Promise<object>}
 */
async function preprocessImage(imageUrl) {
  try {
    if (!imageUrl) {
      throw new Error("Image URL not provided");
    }
    return processImageFromUrl(imageUrl);
  } catch (err) {
    throw err;
  }
}

module.exports = { preprocessImage };
