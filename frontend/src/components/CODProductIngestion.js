import { useState, useEffect, useRef } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";

export default function CODIngestionPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stagingId, setStagingId] = useState(null);
  const [awaitingFinalize, setAwaitingFinalize] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showAlert } = useAlert();

  /* ---------------- SYSTEM MESSAGE ---------------- */
  useEffect(() => {
    setMessages([
      {
        from: "system",
        text:
          "Welcome! 👋\n\nSend product IMAGES first.\nThen send product DESCRIPTION.",
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- IMAGE HANDLING ---------------- */
  const handleImageSelect = (files) => {
    if (!files.length) return;
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const uploadImagesIfAny = async () => {
    if (!selectedFiles.length) return null;

    const form = new FormData();
    selectedFiles.forEach(f => form.append("images", f));
    if(stagingId) form.append("stagingId",stagingId);
    const res = await api.post("/ingestion/images", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const id = res.data.stagingId;
    setStagingId(id);

    setMessages(prev => [
      ...prev,
      {
        from: "you",
        images: selectedFiles.map(f => URL.createObjectURL(f)),
      },
    ]);

    setSelectedFiles([]);

    return id;   // 🔥 critical
  };


  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    const cleanText = text.trim();
    if (!cleanText && !selectedFiles.length) return;

    /* FINALIZE RESPONSE */
    if (awaitingFinalize) {
      const answer = cleanText.toLowerCase();
      if (["y", "yes"].includes(answer)) {
        await finalizeProduct();
      } else if (["n", "no"].includes(answer)) {
        setMessages(prev => [
          ...prev,
          { from: "you", text: cleanText },
          { from: "system", text: "Okay 👍 You can update images or description." },
        ]);
      }
      setAwaitingFinalize(false);
      setText("");
      return;
    }

    try {
      /* 1️⃣ Upload images first (if any) */
      let activeStagingId = stagingId;
      if (selectedFiles.length) {
        activeStagingId = await uploadImagesIfAny();
      }

      if (cleanText && activeStagingId) {
        const res = await api.post("/ingestion/description", {
          stagingId: activeStagingId,
          description: cleanText,
        });

        setMessages(prev => [
          ...prev,
          { from: "you", text: cleanText },
          {
            from: "system",
            text: `Product: ${res.data.product_name || "Unknown"}\nPrice: ₹${res.data.price || "N/A"}`,
          },
          {
            from: "system",
            text: "Finalize product? (y/n)",
          },
          
        ]);

        setAwaitingFinalize(true);
      }

      setText("");
    } catch {
      showAlert("Message failed");
    }
  };

  /* ---------------- FINALIZE ---------------- */
  const finalizeProduct = async () => {
    try {
      setMessages(prev => [
        ...prev,
        {
            from: "system",
            text: "Processing image...",
          },
      ]);
      await api.post("/ingestion/finalize-cod", { stagingId });
      setMessages(prev => [
        ...prev,
        { from: "system", text: "✅ Product Published Successfully!" },
      ]);
      showAlert("Product Published 🎉", "success");
    } catch {
      showAlert("Finalize Failed");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div style={styles.page}>
      {/* ================= CHAT ================= */}
      <div style={styles.chatBox}>
        <div style={styles.header}></div>

        <div style={styles.chatArea}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.from === "you" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.msg,
                  background: msg.from === "you" ? "#dcf8c6" : "#fff",
                }}
              >
                {msg.text && <div style={styles.msgText}>{msg.text}</div>}
                {msg.images &&
                  msg.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" style={styles.thumbnail} />
                  ))}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* ================= IMAGE PREVIEW ================= */}
        {selectedFiles.length > 0 && (
          <div style={styles.previewRow}>
            {selectedFiles.map((f, i) => (
              <div key={i} style={styles.previewWrapper}>
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  style={styles.previewImg}
                />
                <button
                  style={styles.removeImgBtn}
                  onClick={() =>
                    setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= INPUT ROW ================= */}
        <div style={styles.inputRow}>
          <button
            onClick={() => fileInputRef.current.click()}
            style={styles.plusBtn}
          >
            +
          </button>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            style={styles.textInput}
          />

          <button onClick={handleSend} style={styles.sendBtn}>
            Send
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={e => handleImageSelect([...e.target.files])}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#efeae2",
  },

  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "99vw",
  },

  header: {
    borderBottom: "1px solid #ccc",
    background: "#fafafa",
  },

  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    background: "#efeae2",
    paddingBottom: 140,
  },

  msg: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },

  msgText: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },

  thumbnail: {
    width: 140,
    borderRadius: 10,
    marginTop: 6,
  },

  previewRow: {
    display: "flex",
    gap: 8,
    padding: 8,
    borderTop: "1px solid #ddd",
    overflowX: "auto",
    backgroundColor : "#dcf5c7",
    maxHeight : 100,
  },

  previewImg: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    padding: 10,
    gap: 8,
    borderTop: "1px solid #ccc",
    zIndex:9,
    position: "sticky",
    // width : window.innerWidth
  },

  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#ffffff",
    fontSize: 20,
    cursor: "pointer",
    border:"1px solid #ccc"
  },

  textInput: {
    flex: 1,
    resize: "none",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ccc",
    maxHeight: 80,
  },

  sendBtn: {
    padding: "8px 14px",
    background: "#128c7e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
  },
  previewWrapper: {
    position: "relative",
    display: "inline-block",
  },

  removeImgBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
  },

};

