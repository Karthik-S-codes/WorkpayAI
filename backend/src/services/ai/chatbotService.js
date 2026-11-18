/**
 * AI Assistant Chatbot Service
 * Multilingual Support: English (en), Kannada (kn), Hindi (hi)
 * Covers:
 * - Finding jobs & applications
 * - Hiring workers & post-a-job instructions
 * - Profile building & worker verification
 * - Payment workflow (Razorpay, digital ledger, payouts)
 * - Safe escrow & dispute resolution
 */

const KNOWLEDGE_BASE = {
  en: {
    greetings: [
      "Hello! Welcome to WorkPay AI. How can I assist you today? You can ask me about hiring workers, applying for jobs, payments, or setting up your profile.",
      "Namaste! I am your WorkPay AI Assistant. Whether you are looking for reliable workers or seeking work, I'm here to help."
    ],
    find_workers: "To find workers:\n1. Click 'Find Workers' in the top menu.\n2. Filter by Category (e.g. Electrician, Plumber), Location, and Experience.\n3. Browse verified worker profiles and click 'Hire Worker' to send an offer directly.",
    post_job: "To post a job:\n1. Go to 'Post a Job' in your Customer Dashboard.\n2. Fill in the title, category, budget, and location.\n3. Use our 'AI Job Description Generator' to automatically craft a clear project brief!\n4. Workers will receive notifications and submit applications.",
    payments: "WorkPay AI handles payments through secure digital channels (UPI, Netbanking, Cards) using our integrated payment system.\n1. Payments are initiated securely when a job offer is accepted.\n2. Funds are credited to the worker's digital wallet upon your confirmation of work completion.\n3. Tax invoices and receipts are instantly available for download.",
    earnings_wallet: "Workers can view real-time earnings in the 'Wallet' tab.\n- Available Balance: funds ready to withdraw.\n- Payouts: Request a direct transfer to your Bank Account or UPI ID.\n- Payouts are reviewed and settled smoothly.",
    verification: "To get verified as a worker:\n1. Go to 'My Profile' -> 'Edit Profile'.\n2. Fill in your skills, experience, and trade background.\n3. Upload your ID proof or trade certificates.\n4. Our admin team audits documents within 24 hours to award the Verified Worker Badge.",
    disputes: "If you face any issue with work quality or payment:\n1. Navigate to 'Disputes' in your dashboard.\n2. Click 'Raise Dispute' with job details and reason.\n3. WorkPay AI administrators investigate the dispute and issue fair resolutions or refunds.",
    default: "I'm here to help with jobs, hiring, worker profiles, payments, or platform guidelines. Could you please specify if you're a customer looking to hire, or a worker seeking opportunities?"
  },
  kn: {
    greetings: [
      "ನಮಸ್ಕಾರ! ವರ್ಕ್‌ಪೇ ಎಐ (WorkPay AI) ಗೆ ಸುಸ್ವಾಗತ. ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಲು, ಉದ್ಯೋಗ ಹುಡುಕಲು ಅಥವಾ ಪಾವತಿಗಳ ಬಗ್ಗೆ ತಿಳಿಯಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
      "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವರ್ಕ್‌ಪೇ ಎಐ ಸಹಾಯಕ. ನೀವು ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಾ ಅಥವಾ ಕೆಲಸ ಹುಡುಕುತ್ತಿದ್ದೀರಾ?"
    ],
    find_workers: "ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಲು:\n1. ಮೇಲಿನ ಮೆನುವಿನಲ್ಲಿ 'Find Workers' ಕ್ಲಿಕ್ ಮಾಡಿ.\n2. ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ಪ್ಲಂಬರ್ ಮುಂತಾದ ವಿಭಾಗ ಮತ್ತು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ.\n3. ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕರ ವಿವರಗಳನ್ನು ನೋಡಿ 'Hire Worker' ಕ್ಲಿಕ್ ಮಾಡಿ ನೇರ ಕೋರಿಕೆ ಕಳುಹಿಸಿ.",
    post_job: "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಲು:\n1. ಗ್ರಾಹಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ 'Post a Job' ಕ್ಲಿಕ್ ಮಾಡಿ.\n2. ಶೀರ್ಷಿಕೆ, ವಿಭಾಗ, ಬಜೆಟ್ ಮತ್ತು ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ.\n3. ನಮ್ಮ AI ಉದ್ಯೋಗ ವಿವರಣೆ ಜನರೇಟರ್ ಬಳಸಿ ಸುಲಭವಾಗಿ ವಿವರಣೆ ತಯಾರಿಸಿ ಪೋಸ್ಟ್ ಮಾಡಿ.",
    payments: "ವರ್ಕ್‌ಪೇ ಎಐ ನಲ್ಲಿ ಪಾವತಿಗಳು ಸುರಕ್ಷಿತ ಮತ್ತು ಡಿಜಿಟಲ್ (UPI, ಕಾರ್ಡ್‌ಗಳು) ಮೂಲಕ ನಡೆಯುತ್ತವೆ.\nಕೆಲಸ ಮುಗಿದ ನಂತರ ಗ್ರಾಹಕರು ಅನುಮೋದಿಸಿದ ತಕ್ಷಣ ಕಾರ್ಮಿಕರ ವಾಲೆಟ್‌ಗೆ ಹಣ ಜಮೆಯಾಗುತ್ತದೆ.",
    earnings_wallet: "ಕಾರ್ಮಿಕರು ತಮ್ಮ 'Wallet' ವಿಭಾಗದಲ್ಲಿ ಗಳಿಕೆಯನ್ನು ನೋಡಬಹುದು. ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಥವಾ ಯುಪಿಐ (UPI) ಮೂಲಕ ನೇರವಾಗಿ ನಿಮ್ಮ ಖಾತೆಗೆ ಹಣ ವರ್ಗಾವಣೆ ಮಾಡಿಕೊಳ್ಳಬಹುದು.",
    verification: "ಪರಿಶೀಲನೆ (Verification) ಪಡೆಯಲು:\nನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಕೌಶಲ್ಯಗಳು, ಅನುಭವ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಅಡ್ಮಿನ್ ಪರಿಶೀಲಿಸಿ 'Verified' ಬ್ಯಾಡ್ಜ್ ನೀಡುತ್ತಾರೆ.",
    disputes: "ಕೆಲಸ ಅಥವಾ ಪಾವತಿಯಲ್ಲಿ ಯಾವುದೇ ಸಮಸ್ಯೆ ಇದ್ದರೆ 'Disputes' ವಿಭಾಗದಲ್ಲಿ ದೂರು ದಾಖಲಿಸಬಹುದು. ನಮ್ಮ ತಂಡವು ತನಿಖೆ ನಡೆಸಿ ನ್ಯಾಯಯುತ ಪರಿಹಾರ ನೀಡುತ್ತದೆ.",
    default: "ನಾನು ನಿಮಗೆ ಉದ್ಯೋಗ, ನೇಮಕಾತಿ ಮತ್ತು ಪಾವತಿಗಳ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಗ್ರಾಹಕರೇ ಅಥವಾ ಕಾರ್ಮಿಕರೇ ಎಂದು ತಿಳಿಸಿ."
  },
  hi: {
    greetings: [
      "नमस्ते! WorkPay AI में आपका स्वागत है। कामगारों को काम पर रखने, नौकरी ढूंढने या भुगतान के बारे में आपकी क्या मदद कर सकता हूँ?",
      "नमस्ते! मैं आपका WorkPay AI सहायक हूँ। क्या आप कारीगर ढूंढ रहे हैं या नौकरी की तलाश में हैं?"
    ],
    find_workers: "कारीगरों को खोजने के लिए:\n1. मुख्य मेनू में 'Find Workers' पर क्लिक करें।\n2. इलेक्ट्रीशियन, प्लंबर जैसी श्रेणी और अपना शहर चुनें।\n3. प्रोफाइल देखकर 'Hire Worker' पर क्लिक करके सीधे प्रस्ताव भेजें।",
    post_job: "काम पोस्ट करने के लिए:\n1. 'Post a Job' पेज पर जाएं।\n2. काम का विवरण, आवश्यक कौशल और बजट भरें।\n3. पोस्ट करने के बाद योग्य कारीगर तुरंत आवेदन करेंगे।",
    payments: "WorkPay AI पर भुगतान पूरी तरह सुरक्षित और डिजिटल (UPI, नेट बैंकिंग) हैं।\nकाम पूरा होने और पुष्टि के बाद पैसे तुरंत कारीगर के वॉलेट में ट्रांसफर हो जाते हैं।",
    earnings_wallet: "कारीगर 'Wallet' सेक्शन में अपनी कुल कमाई देख सकते हैं और बैंक खाते या UPI में पे-आउट (निकासी) अनुरोध कर सकते हैं।",
    verification: "सत्यापन (Verification) के लिए:\nअपनी प्रोफाइल में अनुभव भरें और अपने काम के प्रमाण पत्र अपलोड करें। 24 घंटे में ऑडिट के बाद 'Verified Badge' मिल जाता है।",
    disputes: "यदि काम या भुगतान में कोई समस्या हो, तो 'Disputes' पेज पर जाकर शिकायत दर्ज करें। हमारी टीम तुरंत निष्पक्ष समाधान करती है।",
    default: "मैं नौकरी, कारीगर खोजने, प्रोफाइल बनाने या पेमेंट के बारे में मदद कर सकता हूँ। कृपया अपना प्रश्न विस्तार से बताएं।"
  }
};

function detectIntent(text = '') {
  const q = text.toLowerCase();
  if (/hello|hi|hey|namaste|namaskara|start/i.test(q)) return 'greetings';
  if (/find.*worker|search.*worker|hire|electrician|plumber|carpenter|maid|cook|driver/i.test(q)) return 'find_workers';
  if (/post.*job|create.*job|need.*worker|hire.*someone/i.test(q)) return 'post_job';
  if (/pay|payment|razorpay|cash|money|invoice|receipt/i.test(q)) return 'payments';
  if (/earn|wallet|withdraw|payout|balance|salary/i.test(q)) return 'earnings_wallet';
  if (/verify|verification|badge|certificate|profile/i.test(q)) return 'verification';
  if (/dispute|complain|problem|issue|fraud|refund/i.test(q)) return 'disputes';
  return 'default';
}

async function handleChatMessage({ message, language = 'en', userId = null }) {
  const lang = ['en', 'kn', 'hi'].includes(language) ? language : 'en';

  // Attempt Scikit-Learn Intent Classification via Python FastAPI service
  let detected = { intent: detectIntent(message), engine: 'Rule-Based Regex Classifier' };
  try {
    const pyRes = await fetch('http://127.0.0.1:8000/classify-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message }),
      signal: AbortSignal.timeout(600)
    });
    if (pyRes.ok) {
      const data = await pyRes.json();
      if (data && data.intent) {
        const intentMap = {
          'hire_worker': 'find_workers',
          'find_job': 'earnings_wallet',
          'payment': 'payments',
          'dispute': 'disputes',
          'profile': 'verification'
        };
        detected = {
          intent: intentMap[data.intent] || data.intent,
          engine: 'Python Scikit-Learn (LogisticRegression + TF-IDF)'
        };
      }
    }
  } catch (pyErr) {
    // Python ML offline, fall back to rule-based intent
  }

  const intent = detected.intent;
  const localizedKb = KNOWLEDGE_BASE[lang] || KNOWLEDGE_BASE.en;
  let responseText = localizedKb[intent] || localizedKb.default;

  if (Array.isArray(responseText)) {
    responseText = responseText[Math.floor(Math.random() * responseText.length)];
  }

  // If Gemini API Key is configured, we can generate dynamic context-aware answer
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const geminiResponse = await callGeminiAPI(message, lang);
      if (geminiResponse) {
        responseText = geminiResponse;
      }
    } catch (err) {
      console.warn('[Gemini Chatbot API Fallback]:', err.message);
    }
  }

  return {
    reply: responseText,
    intent,
    engine: detected.engine,
    language: lang,
    timestamp: new Date().toISOString()
  };
}

async function callGeminiAPI(prompt, language) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const langNames = { en: 'English', kn: 'Kannada', hi: 'Hindi' };
  const targetLang = langNames[language] || 'English';

  const systemInstruction = `You are WorkPay AI Assistant, a professional, polite, and helpful assistant for a blue-collar worker hiring and FinTech platform called WorkPay AI. Always respond concisely (2-4 paragraphs) in ${targetLang}. Never fabricate payment credentials. Guide customers on hiring and safe digital payments, and workers on job discovery and earnings.`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }]
      }
    ]
  };

  // Try gemini-3.5-flash first, then gemini-flash-latest
  for (const model of ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-pro-latest']) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      // try next model
    }
  }

  return null;
}

module.exports = {
  handleChatMessage,
  detectIntent
};

