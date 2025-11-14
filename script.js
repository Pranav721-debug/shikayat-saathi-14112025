// ----------------------------
// LANGUAGE PROMPTS
// ----------------------------
const prompts = {
  hi: ["कृपया अपनी समस्या बताएं", "कृपया अपने गांव और राज्य का नाम बताएं", "कृपया अपना नाम बताएं", "धन्यवाद, आपकी समस्या रिकॉर्ड कर ली गई है", "आपका सहायक", "बोलें"],
  kn: ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಳ್ಳಿ ಮತ್ತು ರಾಜ್ಯದ ಹೆಸರನ್ನು ಹೇಳಿ", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ", "ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಸಮಸ್ಯೆ ದಾಖಲಾಗಿದೆ", "ನಿಮ್ಮ ಸಹಾಯಕ", "ಮಾತನಾಡಿ"],
  ta: ["தயவுசெய்து உங்கள் பிரச்சனையை கூறுங்கள்", "தயவுசெய்து உங்கள் கிராமம் மற்றும் மாநிலத்தின் பெயரை கூறுங்கள்", "தயவுசெய்து உங்கள் பெயரை கூறுங்கள்", "நன்றி, உங்கள் பிரச்சனை பதிவு செய்யப்பட்டுள்ளது", "உங்கள் உதவியாளர்", "பேசவும்"],
  ur: ["براہ کرم اپنی مسئلہ بتائیں", "براہ کرم اپنے گاؤں اور ریاست کا نام بتائیں", "براہ کرم اپنا نام بتائیں", "شکریہ، آپ کا مسئلہ ریکارڈ کر لیا گیا ہے", "آپ کا معاون", "بولیں"],
  gu: ["કૃપા કરીને તમારીבעיה કહો", "તમારા ગામ અને રાજ્યનું નામ કહો", "તમારું નામ કહો", "આભાર, તમારી સમસ્યા નોંધાઈ ગઈ છે", "તમારો સહાયક", "બોલો"],
  bn: ["আপনার সমস্যাটি বলুন", "আপনার গ্রাম এবং রাজ্যের নাম বলুন", "আপনার নাম বলুন", "ধন্যবাদ, আপনার সমস্যাটি রেকর্ড করা হয়েছে", "আপনার সহায়ক", "বলুন"],
  or: ["ଦୟାକରି ଆପଣଙ୍କର ସମସ୍ୟା କୁ କୁହନ୍ତୁ", "ଆପଣଙ୍କ ଗାଁ ଓ ରାଜ୍ୟର ନାମ କୁହନ୍ତୁ", "ଆପଣଙ୍କ ନାମ କୁହନ୍ତୁ", "ଧନ୍ୟବାଦ, ଆପଣଙ୍କ ସମସ୍ୟା ରେକର୍ଡ ହୋଇଛି", "ଆପଣଙ୍କ ସହାୟକ", "କୁହନ୍ତୁ"],
  raj: ["कृपया थारी समस्स्या बतावो", "थारो गांव अर राज्य को नाम बोलो", "थारो नाम बतावो", "धन्यवाद, थारी समस्स्या रिकॉर्ड कर ली गई है", "थारो सहायक", "बोलो"]
};

// ----------------------------
// GOOGLE TRANSLATE TTS FUNCTION
// ----------------------------
function speak(text, lang) {
  const utter = new SpeechSynthesisUtterance(text);

  const voiceMap = {
    hi: "hi",
    bn: "bn",
    ta: "ta",
    gu: "gu",
    kn: "kn",
    or: "or",
    ur: "ur",
    raj: "hi"
  };

  const targetLang = voiceMap[lang] || "hi";

  const voices = speechSynthesis.getVoices();

  let selected = voices.find(v => v.lang.toLowerCase().includes(targetLang));

  if (!selected) {
    selected = voices.find(v => v.lang.toLowerCase().startsWith("en")) || voices[0];
  }

  utter.voice = selected;
  utter.lang = selected.lang;
  utter.pitch = 1;
  utter.rate = 1;
  utter.volume = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

speechSynthesis.onvoiceschanged = () => {};


// ----------------------------
// MAIN LOGIC
// ----------------------------
let currentLang = "hi";
let step = 0;

function selectLanguage(lang) {
  currentLang = lang;
  step = 0;

  document.getElementById("stepText").innerText = prompts[lang][0];
  document.getElementById("slogan").innerText = prompts[lang][4];
  document.getElementById("micButton").innerText = "🎤 " + prompts[lang][5];

  speak(prompts[lang][0], ttsLang[lang]);
}

window.startRecognition = function () {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  const recogLang = {
    hi: "hi-IN",
    kn: "kn-IN",
    ta: "ta-IN",
    ur: "ur-PK",
    gu: "gu-IN",
    bn: "bn-IN",
    or: "or-IN",
    raj: "hi-IN"
  };

  const recognition = new webkitSpeechRecognition();
  recognition.lang = recogLang[currentLang] || "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    const resultBox = document.getElementById("resultText");

    resultBox.innerText += (resultBox.innerText ? "\n" : "") + text;

    step++;

    if (step < 3) {
      document.getElementById("stepText").innerText = prompts[currentLang][step];
      speak(prompts[currentLang][step], ttsLang[currentLang]);
      setTimeout(() => recognition.start(), 2000);
    } else {
      document.getElementById("stepText").innerText = prompts[currentLang][3];
      speak(prompts[currentLang][3], ttsLang[currentLang]);

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
        () => alert("Location denied.")
      );

      step = 0;
    }
  };

  speak(prompts[currentLang][step], ttsLang[currentLang]);
  setTimeout(() => recognition.start(), 1500);
};

