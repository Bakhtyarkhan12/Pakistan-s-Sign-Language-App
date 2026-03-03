import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Holistic, POSE_CONNECTIONS, HAND_CONNECTIONS } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import * as drawingUtils from "@mediapipe/drawing_utils";

const SEQUENCE_LENGTH = 30;
const FEATURE_SIZE = 225;
const CONFIDENCE_THRESHOLD = 0.5;

const fallbackUrduMap = {
  Alif: "ا", Bay: "ب", Pay: "پ", Tay: "ت", TTAY: "ٹ", Say: "ث", Jeem: "ج", Chay: "چ",
  "Choti-ye": "ے", "bari-ye": "ی", Dal: "د", Ddal: "ڈ", Fay: "ف", Ghain: "غ", Hamza: "ء",
  Hay: "ح", He: "ہ", Kaaf: "ک", Khay: "خ", Laam: "ل", Meem: "م", Noon: "ن", Qaaf: "ق",
  Ray: "ر", Sheen: "ش", seen: "س", Toain: "ط", Ttay: "ظ", Wao: "و", Zal: "ذ",
  Zoain: "ض", Zuaad: "ض", rray: "ڑ", suaad: "ص", zay: "ز",
  APPLE: "سیب", Aj: "آج", Allah: "اللّٰہ", "Allama Iqbal": "علامہ اقبال", Ap: "آپ", Apki: "آپکی",
  Assalamulaikum: "السلام علیکم", "Baad may": "بعد میں", Bachay: "بچے", "Barai Mehrbani": "براہ مہربانی",
  Behra: "بہرا", Bemar: "بیمار", Cherry: "چیری", Cuckoo: "کوئل",
  Duck: "بطخ", "Dur hai": "دور ہے", Eagle: "عقاب", "Email Address": "ای میل", Falcon: "باز",
  Fig: "انجیر", Firaun: "فرعون", "G Han": "جی ہاں", Gaaf: "گ", "Genghis Khan": "چنگیز خان",
  Guava: "امرود", Hain: "ہیں", Iski: "اسکی", Jao: "جاؤ", Kab: "کب", Kesay: "کیسے",
  "Kya qeemat hai": "کیا قیمت ہے", "Lord Mountbatten": "لارڈ ماؤنٹ بیٹن", "Mahatma Gandhi": "مہاتما گاندھی",
  "Mahsoos kar rahay": "محسوس کر رہے ہیں", "Muhammad Ali Jinnah": "محمد علی جناح",
  "Muhammad Bin Qasim": "محمد بن قاسم", Mujhay: "مجھے", "Nahi hai": "نہیں ہے", Peach: "آڑو",
  Penguin: "پینگوئن", Pigeon: "کبوتر", Pineapple: "انناس", Samjhna: "سمجھنا", "Seekh raha hun": "سیکھ رہا ہوں",
  "Shirt dhona hai": "قمیض دھونی ہے", "Sikander-e-Azam": "سکندر اعظم", Walaikumasalam: "و علیکم السلام",
  Watermelon: "تربوز", Woodpecker: "ٹھونکنے والا پرندہ", Yaqeen: "یقین", Ye: "یہ",
  "Zulfiqar Ali Bhutto": "ذوالفقار علی بھٹو", owl: "الو", parrot: "طوطا"
};

const TranslationPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);
  const sendingRef = useRef(false);

  const [currentPrediction, setCurrentPrediction] = useState("");
  const [sentence, setSentence] = useState("");
  const [chat, setChat] = useState([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ur-PK";
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const fallbackTranslate = (text) => {
    return text
      .split(" ")
      .map((word) => fallbackUrduMap[word] || word)
      .join(" ");
  };

  const translateToUrdu = async (text) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return fallbackTranslate(text);

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a professional Urdu language assistant. You will receive broken Urdu phrases or sequences of recognized gesture words. Your job is to combine them and improve the sentence to make it sound natural and complete. Only return the final Urdu sentence."
            },
            {
              role: "user",
              content: `Improve and complete this: "${text}"`
            }
          ],
          temperature: 0.4,
          max_tokens: 80
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.data.choices[0].message.content.trim();
    } catch (err) {
      return fallbackTranslate(text);
    }
  };

  const getLandmarkCoords = (landmarks, expectedLen) => {
    if (!landmarks) return Array(expectedLen).fill(0);
    const coords = landmarks.map((lm) => [lm.x, lm.y, lm.z]);
    const base = coords[0];
    const normalized = coords.map(([x, y, z]) => [x - base[0], y - base[1], z - base[2]]);
    return normalized.flat();
  };

  const onResults = async (results) => {
    const left = getLandmarkCoords(results.leftHandLandmarks, 63);
    const right = getLandmarkCoords(results.rightHandLandmarks, 63);
    const pose = getLandmarkCoords(results.poseLandmarks?.slice(0, 33), 99);
    const combined = [...left, ...right, ...pose];

    const hasHand = results.leftHandLandmarks || results.rightHandLandmarks;
    const hasPose = !!results.poseLandmarks;

    if (combined.length === FEATURE_SIZE && hasPose && hasHand) {
      bufferRef.current.push(combined);
      if (bufferRef.current.length > SEQUENCE_LENGTH) bufferRef.current.shift();

      if (bufferRef.current.length === SEQUENCE_LENGTH && !sendingRef.current) {
        sendingRef.current = true;
        try {
          const res = await axios.post("http://localhost:8000/predict", {
            sequence: bufferRef.current
          });
          const { word, confidence } = res.data;

          if (confidence >= CONFIDENCE_THRESHOLD) {
            setCurrentPrediction(`${word} (${(confidence * 100).toFixed(1)}%)`);
          } else {
            setCurrentPrediction("Detecting...");
          }
        } catch (err) {
          setError("Prediction failed. Check backend or model.");
        } finally {
          bufferRef.current = [];
          sendingRef.current = false;
        }
      }
    } else {
      bufferRef.current = [];
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    if (results.poseLandmarks) {
      drawingUtils.drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
      drawingUtils.drawLandmarks(ctx, results.poseLandmarks, { color: "#FF0000", lineWidth: 1 });
    }

    if (results.leftHandLandmarks) {
      drawingUtils.drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: "#00FFFF", lineWidth: 2 });
      drawingUtils.drawLandmarks(ctx, results.leftHandLandmarks, { color: "#FF00FF", lineWidth: 1 });
    }

    if (results.rightHandLandmarks) {
      drawingUtils.drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: "#FFA500", lineWidth: 2 });
      drawingUtils.drawLandmarks(ctx, results.rightHandLandmarks, { color: "#0000FF", lineWidth: 1 });
    }

    ctx.restore();
  };

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    holistic.onResults(onResults);

    const startCamera = async () => {
      const videoElement = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 960, height: 540 },
        audio: false
      });
      videoElement.srcObject = stream;
      await videoElement.play();

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await holistic.send({ image: videoElement });
        },
        width: 960,
        height: 540
      });
      camera.start();
    };

    startCamera().catch((err) => {
      setError("Unable to access webcam. Please allow camera permissions.");
    });

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleAddPrediction = async () => {
    if (currentPrediction && currentPrediction !== "Detecting...") {
      const word = currentPrediction.split(" (")[0];
      const newSentence = `${sentence} ${word}`.trim();
      const translated = await translateToUrdu(newSentence);
      setSentence(translated);
      setCurrentPrediction("");
    }
  };

  const handleClearPrediction = () => {
    setCurrentPrediction("");
  };

  const handleSendFinalSentence = () => {
    if (sentence.trim() !== "") {
      const msg = { sender: "Deaf", text: sentence.trim() };
      setChat((prev) => [...prev, msg]);
      speak(msg.text);
      setSentence("");
    }
  };

  const handleSendNonDeaf = () => {
    if (inputText.trim() !== "") {
      const msg = { sender: "Non-Deaf", text: inputText.trim() };
      setChat((prev) => [...prev, msg]);
      speak(msg.text);
      setInputText("");
    }
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2>🧠 SignSpeakly Live Translator</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        <div style={{ position: "relative", width: "85%", margin: "auto" }}>
          <video ref={videoRef} autoPlay muted playsInline style={{
            width: "100%", borderRadius: "10px", border: "4px solid #2e7d32",
            objectFit: "cover", transform: "scaleX(-1)"
          }} />
          <canvas ref={canvasRef} style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 10
          }} />
        </div>
        <div style={{ marginTop: "16px", fontSize: "22px", fontWeight: "bold", color: "#2e7d32" }}>
          {currentPrediction || "⏳ Waiting for prediction..."}
        </div>
        <div style={{ marginTop: "12px" }}>
          <button onClick={handleAddPrediction} style={{ marginRight: "10px" }}>Add</button>
          <button onClick={handleClearPrediction}>Clear</button>
        </div>
        <div style={{ marginTop: "16px" }}>
          <textarea readOnly value={sentence} rows={3} placeholder="Final translated sentence..." style={{
            width: "85%", maxWidth: "800px", padding: "12px", fontSize: "18px",
            borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "#f0fdf4", color: "#333"
          }} />
          <br />
          <button onClick={handleSendFinalSentence} style={{
            marginTop: "10px", padding: "10px 20px", fontSize: "16px",
            backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px"
          }}>Send</button>
        </div>
      </div>

      <div style={{
        width: "30%", marginLeft: "20px", padding: "16px", border: "2px solid #ccc",
        borderRadius: "10px", backgroundColor: "#f9f9f9"
      }}>
        <h3 style={{ marginBottom: "12px", color: "#333" }}>💬 Chat Box</h3>
        <div style={{
          maxHeight: "400px", overflowY: "auto", marginBottom: "12px",
          padding: "8px", border: "1px solid #ddd", backgroundColor: "#fff"
        }}>
          {chat.map((msg, index) => (
            <div key={index} style={{ textAlign: msg.sender === "Deaf" ? "left" : "right" }}>
              <p style={{
                margin: "4px 0", padding: "6px 10px", borderRadius: "10px",
                backgroundColor: msg.sender === "Deaf" ? "#e1f5fe" : "#c8e6c9", display: "inline-block"
              }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            </div>
          ))}
        </div>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..." style={{
            width: "100%", padding: "8px", fontSize: "16px", borderRadius: "6px",
            border: "1px solid #ccc", marginBottom: "8px"
          }} />
        <button onClick={handleSendNonDeaf} style={{
          width: "100%", padding: "8px", fontSize: "16px",
          backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px"
        }}>Send</button>
      </div>
    </div>
  );
};

export default TranslationPage;
