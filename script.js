/****************************************************
 🔓 1. UNLOCK AUDIO ON FIRST USER ACTION (MANDATORY)
*****************************************************/
document.addEventListener(
  "click",
  () => {
    const unlock = new SpeechSynthesisUtterance("");
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
  },
  { once: true }
);

/****************************************************
 🔥 FIREBASE CONFIG
*****************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/****************************************************
 🔥 COMPLAINT TRACKER
*****************************************************/
window.trackComplaint = async () => {
  const trackId = document.getElementById("trackId").value.trim();
  const resultDiv = document.getElementById("trackResult");
  if (!trackId) return alert("Please enter your Complaint ID.");

  try {
    const docSnap = await getDoc(doc(db, "complaints", trackId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const time = data.timestamp?.toDate().toLocaleString() || "Unknown";

      resultDiv.innerHTML = `
        <hr><strong>Complaint Details:</strong><br>
        <strong>Name:</strong> ${data.name}<br>
        <strong>Village:</strong> ${data.village}<br>
        <strong>Problem:</strong> ${data.problem}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Filed At:</strong> ${time}<br>`;
    } else resultDiv.innerHTML = "❌ No complaint found with this ID.";
  } catch (e) {
    console.error("Track Error:", e);
    resultDiv.innerHTML = `❌ Error fetching data: ${e.message}`;
  }
};

/****************************************************
 🔥 SEND COMPLAINT TO FIREBASE
*****************************************************/
window.sendComplaintToFirebase = async (name, village, problem, lat, long) => {
  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      name,
      village,
      problem,
      status: "Received",
      location: { latitude: lat, longitude: long },
      timestamp: new Date()
    });

    alert(`✅ Complaint Registered!\nComplaint ID: ${docRef.id}`);
  } catch (e) {
    alert(`❌ Failed to submit: ${e.message}`);
    console.error(e);
  }
};

/****************************************************
 🔥 LANGUAGE PROMPTS
*****************************************************/
const prompts = {
  hi: ["अपनी समस्या बताएं", "अपने गाँव का नाम बताएं", "अपना नाम बताएं", "धन्यवाद, आपकी समस्या दर्ज हो गई है", "आपका सहायक", "बोलें"],
  kn: ["ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ", "ನಿಮ್ಮ ಹಳ್ಳಿ ಹೆಸರನ್ನು ಹೇಳಿ", "ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ", "ಧನ್ಯವಾದಗಳು, ಸಮಸ್ಯೆ ದಾಖಲಾಗಿದೆ", "ನಿಮ್ಮ ಸಹಾಯಕ", "ಮಾತನಾಡಿ"],
  ta: ["உங்கள் பிரச்சனையை சொல்லுங்கள்", "உங்கள் கிராமத்தின் பெயரை சொல்லுங்கள்", "உங்கள் பெயரை சொல்லுங்கள்", "நன்றி, பதிவு செய்யப்பட்டது", "உங்கள் உதவியாளர்", "பேசவும்"],
  ur: ["اپنی مسئلہ بتائیں", "آپ کے گاؤں کا نام کیا ہے؟", "آپ کا نام کیا ہے؟", "شکریہ، مسئلہ درج کر لیا گیا ہے", "آپ کا معاون", "بولیں"],
  gu: ["તમારી સમસ્યા કહો", "તમારા ગામનું નામ કહો", "તમારું નામ કહો", "આભાર, સમસ્યા નોંધાઈ ગઈ છે", "તમારો સહાયક", "બોલો"],
  bn: ["সমস্যাটা বলুন", "আপনার গ্রামের নাম বলুন", "আপনার নাম বলুন", "ধন্যবাদ, রেকর্ড করা হয়েছে", "আপনার সহায়ক", "বলুন"],
  or: ["ଆପଣଙ୍କ ସମସ୍ୟା କୁହନ୍ତୁ", "ଗାଁର ନାମ କୁହନ୍ତୁ", "ନାମ କୁହନ୍ତୁ", "ଧନ୍ୟବାଦ, ସମସ୍ୟା ଦର୍ଜ ହୋଇଛି", "ଆପଣଙ୍କ ସହାୟକ", "କୁହନ୍ତୁ"],
  raj: ["थारी समस्या बतावो", "थारो गाँव बतावो", "थारो नाम बतावो", "धन्यवाद, समस्या दर्ज हो गई", "थारो सहायक", "बोलो"]
};

let currentLang = "hi";
let step = 0;

/****************************************************
 🔥 SELECT LANGUAGE
*****************************************************/
window.selectLanguage = (lang) => {
  currentLang = lang;
  step = 0;

  document.getElementById("stepText").innerText = prompts[lang][0];
  document.getElementById("micButton").innerText = "🎤 " + prompts[lang][5];
  document.getElementById("slogan").innerText = prompts[lang][4];

  speak(prompts[lang][0], lang);
};

/****************************************************
 🔥 UNIVERSAL SPEAK FUNCTION
*****************************************************/
function speak(text, lang) {
  return new Promise((resolve) => {
    const msg = new SpeechSynthesisUtterance(text);

    const langMap = {
      hi: "hi-IN",
      raj: "hi-IN",
      bn: "bn-IN",
      gu: "gu-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      or: "or-IN",
      ur: "ur-IN" // more supported than ur-PK
    };

    msg.lang = langMap[lang] || "en-US";
    msg.pitch = 1;
    msg.rate = 0.9;
    msg.volume = 1;

    msg.onend = resolve;
    msg.onerror = resolve;

    window.speechSynthesis.speak(msg);
  });
}

/****************************************************
 🔥 SPEECH RECOGNITION
*****************************************************/
window.startRecognition = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported on this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();

  const recogLangMap = {
    hi: "hi-IN",
    raj: "hi-IN",
    bn: "bn-IN",
    gu: "gu-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    or: "or-IN",
    ur: "ur-IN"
  };

  recognition.lang = recogLangMap[currentLang] || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const resultBox = document.getElementById("resultText");

    resultBox.innerText += (resultBox.innerText ? "\n" : "") + transcript;

    step++;

    if (step < 3) {
      document.getElementById("stepText").innerText = prompts[currentLang][step];
      await speak(prompts[currentLang][step], currentLang);
      recognition.start();
    } else {
      document.getElementById("stepText").innerText = prompts[currentLang][3];
      await speak(prompts[currentLang][3], currentLang);

      const lines = resultBox.innerText.split("\n");
      const problem = lines[0] || "";
      const village = lines[1] || "";
      const name = lines[2] || "";

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          sendComplaintToFirebase(
            name,
            village,
            problem,
            pos.coords.latitude,
            pos.coords.longitude
          ),
        () => alert("Location access denied.")
      );

      step = 0;
    }
  };

  // Speak first → Then start mic
  speak(prompts[currentLang][step], currentLang).then(() => recognition.start());
};
