const express = require("express");
const Twilio = require("twilio");
const extName = require("ext-name");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { pool } = require("../utils/db");
const { preprocessImage } = require("../controllers/pythonController");

const PUBLIC_DIR = "./uploads";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const { NODE_ENV } = process.env;

function MessagingRouter() {
  let twilioClient;
  let images = [];

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(path.resolve(PUBLIC_DIR), { recursive: true });
  }

  function getTwilioClient() {
    return twilioClient || new Twilio(twilioAccountSid, twilioAuthToken);
  }

  async function deleteMediaItem(mediaItem) {
    try {
      const client = getTwilioClient();
      await client
        .api.accounts(twilioAccountSid)
        .messages(mediaItem.MessageSid)
        .media(mediaItem.mediaSid)
        .remove();
    } catch (err) {
      if (err.status === 404) {
        console.warn(`Media already deleted: ${mediaItem.mediaSid}`);
      } else {
        console.error("Twilio delete error:", err.message);
      }
    }
  }

  async function SaveMedia(mediaItem, supplier_id, io) {
    const { mediaUrl, filename } = mediaItem;
    const fullPath = path.resolve(`${PUBLIC_DIR}/${filename}`);

    if (!fs.existsSync(fullPath)) {
      const response = await fetch(mediaUrl, {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${twilioAccountSid}:${twilioAuthToken}`
            ).toString("base64"),
        },
      });

      const fileStream = fs.createWriteStream(fullPath);
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on("error", reject);
        fileStream.on("finish", resolve);
      });

      if (NODE_ENV !== "test") {
        deleteMediaItem(mediaItem);
      }
    }

    // Python classification
    const result = await preprocessImage(fullPath);

    // ✅ SAVE PRODUCT CORRECTLY
    const dbResult = await pool.query(
      `
      INSERT INTO products (supplier_id, images, category)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [supplier_id, [filename], result.category]
    );

    const newProduct = dbResult.rows[0];
    io.to(`user_${supplier_id}`).emit("newProduct", newProduct);
    images.push(filename);
  }

  async function handleIncomingSMS(req, res) {
    try {
      const { body } = req;
      const { NumMedia, From: SenderNumber, MessageSid } = body;
      const io = req.app.get("io");

      if (!NumMedia || Number(NumMedia) === 0) {
        return res.status(200).send();
      }

      const phone = SenderNumber.replace("whatsapp:", "");

      // ✅ CHECK IN SUPPLIERS TABLE
      let supplierRes = await pool.query(
        "SELECT id FROM suppliers WHERE phone_number = $1",
        [phone]
      );

      let supplier_id;

      // ✅ AUTO REGISTER IF NOT EXISTS
      if (supplierRes.rows.length === 0) {
        const insertRes = await pool.query(
          `
          INSERT INTO suppliers (phone_number)
          VALUES ($1)
          RETURNING id
          `,
          [phone]
        );

        supplier_id = insertRes.rows[0].id;
      } else {
        supplier_id = supplierRes.rows[0].id;
      }

      const saveOperations = [];

      for (let i = 0; i < NumMedia; i++) {
        const mediaUrl = body[`MediaUrl${i}`];
        const contentType = body[`MediaContentType${i}`];

        if (!contentType || !contentType.startsWith("image/")) continue;

        const extension = extName.mime(contentType)[0].ext;
        const mediaSid = path.basename(new URL(mediaUrl).pathname);
        const filename = `${mediaSid}.${extension}`;

        saveOperations.push(
          SaveMedia(
            { mediaSid, MessageSid, mediaUrl, filename },
            supplier_id,
            io
          )
        );
      }

      await Promise.all(saveOperations);
      return res.status(200).send();

    } catch (err) {
      console.error("Twilio webhook error:", err);
      return res.status(500).send();
    }
  }

  function fetchRecentImages(req, res) {
    res.status(200).send(images);
    images = [];
  }

  const router = express.Router();
  router.post("/incoming", handleIncomingSMS);
  router.get("/images", fetchRecentImages);
  router.get("/config", (req, res) => {
    res.status(200).send({ twilioPhoneNumber });
  });

  return router;
}

module.exports = {
  MessagingRouter,
};
