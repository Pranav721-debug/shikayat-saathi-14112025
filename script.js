import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyDJuz23DrqGN3i98yGvEp4uI99l0AED6rY",
  authDomain: "shikayat-saathi.firebaseapp.com",
  projectId: "shikayat-saathi",
  storageBucket: "shikayat-saathi.firebasestorage.app",
  messagingSenderId: "810869568803",
  appId: "1:810869568803:web:00400d4b1da0b3b8e14896",
  measurementId: "G-3QP95L1T7T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- Prompts ----------------
const prompts = {
  hi: ["कृपया अपनी समस्या बताएं", "कृपया गांव और राज्य बताएं", "कृपया अपना नाम बताएं", "धन्यवाद! आपकी शिकायत दर्ज हो गई", "आपका सहायक", "बोलें"],
  kn: ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ", "ದಯವಿಟ್ಟು ಹಳ್ಳಿ ಮತ್ತು ರಾಜ್ಯ ಹೇಳಿ", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ", "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ದೂರು ದಾಖಲಾಗಿದೆ", "ನಿಮ್ಮ ಸಹಾಯಕ", "ಮಾತನಾಡಿ"],
  ta: ["உங்கள் பிரச்சனையை கூறுங்கள்", "உங்கள் கிராமம் மற்றும் மாநிலத்தை கூறுங்கள்", "உங்கள் பெயரை கூறுங்கள்", "நன்றி! உங்கள் புகார் பதிவு செய்யப்பட்டது", "உங்கள் உதவியாளர்", "பேசவும்"],
  ur: ["اپنی مسئلہ بتائیں", "گاؤں اور صوبہ بتائیں", "اپنا نام بتائیں", "شکریہ! آپ کی شکایت درج ہوگئی", "آپ کا معاون", "بولیں"],
  gu: ["તમારી સમસ્યા કહો", "તમારું ગામ અને રાજ્ય કહો", "તમારું નામ કહો", "આભાર! તમારી ફરિયાદ નોંધાઈ ગઈ છે", "તમારો સહાયક", "બોલો"],
  bn: ["আপনার সমস্যাটি বলুন", "আপনার গ্রাম এবং রাজ্যের নাম বলুন", "আপনার নাম বলুন", "ধন্যবাদ! আপনার অভিযোগ নথিভুক্ত হয়েছে", "আপনার সহায়ক", "বলুন"],
  or: ["ଆପଣଙ୍କ ସମସ୍ୟା କୁହନ୍ତୁ", "ଗାଁ ଓ ରାଜ୍ୟର ନାମ କୁହନ୍ତୁ", "ନାମ କୁହନ୍ତୁ", "ଧନ୍ୟବାଦ! ଅଭିଯୋଗ ରେକର୍ଡ ହେଲା", "ଆପଣଙ୍କ ସହାୟକ", "କୁହନ୍ତୁ"],
  raj: ["थारी समस्या बतावो", "गाँव अर राज्य बतावो", "थारो नाम बतावो", "धन्यवाद! थारी शिकायत दर्ज हो गी", "थारो सहायक", "बोलो"]
};

// ---------------- **NEW TTS ENGINE (WORKS ON ALL BROWSERS)** ----------------
async function speak(text, lang) {
  try {
    const url = `https://api.voicerss.org/?key=843e7eb331534a5fb93bcad122d51dd7&hl=${lang}&src=${encodeURIComponent(text)}`;

    const audio = new Audio(url);

    await audio.play();
  } catch (err) {
    console.error("TTS Error:", err);
  }
}

const ttsLangMap = {
  hi: "hi-IN", kn: "kn-IN", ta: "ta-IN",
  ur: "ur-PK", gu: "gu-IN", bn: "bn-IN",
  or: "or-IN", raj: "hi-IN"
};

const recogLangMap = ttsLangMap;

let currentLang = "hi";
let step = 0;

// ---------------- Select Language ----------------
window.selectLanguage = (lang) => {
  currentLang = lang;
  step = 0;

  document.getElementById("stepText").innerText = prompts[lang][0];
  document.getElementById("micButton").innerText = "🎤 " + prompts[lang][5];
  document.getElementById("slogan").innerText = prompts[lang][4];

  speak(prompts[lang][0], ttsLangMap[lang]);
};

// ---------------- Speech Recognition ----------------
window.startRecognition = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = recogLangMap[currentLang];

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    const box = document.getElementById("resultText");

    box.innerText += (box.innerText ? "\n" : "") + text;

    step++;

    if (step < 3) {
      document.getElementById("stepText").innerText = prompts[currentLang][step];
      speak(prompts[currentLang][step], ttsLangMap[currentLang]);
      recognition.start();
    } else {
      document.getElementById("stepText").innerText = prompts[currentLang][3];
      speak(prompts[currentLang][3], ttsLangMap[currentLang]);

      const lines = box.innerText.split("\n");
      const problem = lines[0] || "";
      const village = lines[1] || "";
      const name = lines[2] || "";

      navigator.geolocation.getCurrentPosition(
        pos => sendComplaintToFirebase(
          name, village, problem,
          pos.coords.latitude, pos.coords.longitude
        ),
        () => alert("Location denied")
      );

      step = 0;
    }
  };

  speak(prompts[currentLang][step], ttsLangMap[currentLang]);
  recognition.start();
};

// ---------------- Firebase Submit ----------------
window.sendComplaintToFirebase = async (...args) => {
  const [name, village, problem, lat, long] = args;

  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      name, village, problem,
      status: "Received",
      location: { latitude: lat, longitude: long },
      timestamp: new Date()
    });

    alert(`Complaint Registered!\nID: ${docRef.id}`);
  } catch (e) {
    alert("Error: " + e.message);
  }
};

// ---------------- Track Complaint ----------------
window.trackComplaint = async () => {
  const id = document.getElementById("trackId").value.trim();
  const div = document.getElementById("trackResult");

  if (!id) return alert("Enter ID");

  try {
    const snap = await getDoc(doc(db, "complaints", id));
    if (!snap.exists()) return (div.innerHTML = "❌ Not Found");

    const data = snap.data();
    div.innerHTML = `
      <hr><strong>Complaint:</strong><br>
      <strong>Name:</strong> ${data.name}<br>
      <strong>Village:</strong> ${data.village}<br>
      <strong>Problem:</strong> ${data.problem}<br>
      <strong>Status:</strong> ${data.status}<br>
    `;
  } catch (e) {
    div.innerHTML = "❌ Error: " + e.message;
  }
};


