console.log("🔥 Script loaded");
import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("#chat-form");
const chatContainer = document.querySelector("#chat_container");
const voiceButton = document.getElementById("voiceButton");

let loadInterval;
let lastRequestTime = 0;
let recognition = null;
let isRecording = false;
let currentSpeechSynthesis = null;

// Initialize theme and font size from localStorage
function initSettings() {
  const savedTheme = localStorage.getItem("theme") || "cream";
  const savedFontSize = localStorage.getItem("fontSize") || "medium";
  setTheme(savedTheme);
  setFontSize(savedFontSize);
}

// Theme Management
function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.theme === theme) {
      btn.classList.add("active");
    }
  });
  localStorage.setItem("theme", theme);
}

// Font Size Management
function setFontSize(size) {
  // Update body class for global font size (CSS handles the rest)
  document.body.classList.remove("font-small", "font-medium", "font-large");
  document.body.classList.add(`font-${size}`);
  
  document.querySelectorAll(".font-size-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.size === size) {
      btn.classList.add("active");
    }
  });
  localStorage.setItem("fontSize", size);
}

// Initialize Speech Recognition
function initSpeechRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("prompt").value = transcript;
      isRecording = false;
      voiceButton.classList.remove("recording");
      voiceButton.innerHTML = "🎤";
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecording = false;
      voiceButton.classList.remove("recording");
      voiceButton.innerHTML = "🎤";
      alert("Speech recognition error. Please try again.");
    };

    recognition.onend = () => {
      isRecording = false;
      voiceButton.classList.remove("recording");
      voiceButton.innerHTML = "🎤";
    };
  } else {
    voiceButton.style.display = "none";
    console.log("Speech recognition not supported");
  }
}

// Voice Input Handler
function toggleVoiceInput() {
  if (!recognition) {
    alert("Voice input is not supported in your browser.");
    return;
  }

  if (isRecording) {
    recognition.stop();
    isRecording = false;
    voiceButton.classList.remove("recording");
    voiceButton.innerHTML = "🎤";
  } else {
    recognition.start();
    isRecording = true;
    voiceButton.classList.add("recording");
    voiceButton.innerHTML = "🔴";
  }
}

// Get a soothing voice from available voices
function getSoothingVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  // Priority list for soothing voices (common across platforms)
  const soothingVoiceNames = [
    'zira',           // Windows - Microsoft Zira (Female, English US)
    'hazel',          // Windows - Microsoft Hazel (Female, English UK)
    'susan',          // Some systems
    'karen',          // macOS
    'samantha',       // macOS
    'victoria',       // Some systems
    'female',         // Generic female voices
    'uk english female', // Google UK English Female
    'en-gb',          // UK English voices (often softer)
  ];

  // Try to find a preferred soothing voice
  for (const name of soothingVoiceNames) {
    const found = voices.find(voice => 
      voice.name.toLowerCase().includes(name.toLowerCase())
    );
    if (found) {
      return found;
    }
  }

  // Fallback: Find any English female voice
  const englishVoices = voices.filter(voice => 
    voice.lang.startsWith('en') && 
    !voice.name.toLowerCase().includes('male') &&
    !voice.name.toLowerCase().includes('david') &&
    !voice.name.toLowerCase().includes('mark') &&
    !voice.name.toLowerCase().includes('richard') &&
    !voice.name.toLowerCase().includes('james')
  );

  if (englishVoices.length > 0) {
    // Prefer UK English voices (often softer/calmer)
    const ukVoice = englishVoices.find(v => v.lang.includes('GB') || v.lang.includes('UK'));
    return ukVoice || englishVoices[0];
  }

  // Last resort: return first English voice
  const anyEnglish = voices.find(voice => voice.lang.startsWith('en'));
  return anyEnglish || voices[0];
}

// Text-to-Speech with soothing voice
function speakText(text) {
  // Stop any ongoing speech
  if (currentSpeechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // Remove HTML tags and get clean text
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = text;
  const cleanText = tempDiv.textContent || tempDiv.innerText || "";

  if (cleanText.trim()) {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Soothing voice settings for a calm, gentle reading experience
    utterance.rate = 0.82; // Slower pace (0.1-10, default 1) - calm and clear
    utterance.pitch = 0.88; // Slightly lower pitch (0-2, default 1) - warmer, more soothing
    utterance.volume = 0.88; // Gentle volume (0-1, default 1) - not too loud
    utterance.lang = "en-US";

    // Select the most soothing voice available
    const soothingVoice = getSoothingVoice();
    if (soothingVoice) {
      utterance.voice = soothingVoice;
      // If it's a UK voice, set the language accordingly
      if (soothingVoice.lang.includes('GB') || soothingVoice.lang.includes('UK')) {
        utterance.lang = "en-GB";
      }
    }

    currentSpeechSynthesis = utterance;
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      currentSpeechSynthesis = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      currentSpeechSynthesis = null;
    };
  }
}

// Stop Text-to-Speech
function stopSpeech() {
  if (currentSpeechSynthesis) {
    window.speechSynthesis.cancel();
    currentSpeechSynthesis = null;
  }
}

// Removed simplify and highlight functions as buttons are no longer needed

// Generate unique ID
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// Create chat stripe with action buttons
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? "ai" : "user"}">
      <div class="chat">
        <div class="message-container">
          <div class="profile">
            <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <div class="message" id="${uniqueId}">${value}</div>
            ${isAi ? `<div class="message-actions" data-message-id="${uniqueId}"></div>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add action buttons to AI messages after they're inserted
function addMessageActions(messageId) {
  const actionsContainer = document.querySelector(
    `[data-message-id="${messageId}"]`
  );
  if (actionsContainer && !actionsContainer.querySelector(".message-action-btn")) {
    actionsContainer.innerHTML = `
      <button class="message-action-btn speak-btn" data-action="speak" title="Read aloud with soothing voice">
        🎧 Read Aloud
      </button>
    `;

    // Add event listener
    actionsContainer
      .querySelector(".speak-btn")
      .addEventListener("click", () => speakMessage(messageId));
  }
}

// Message action functions
function speakMessage(messageId) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    speakText(messageDiv.innerHTML);
  }
}

// Loader function (simplified, no animation for dyslexia-friendly)
function loader(element) {
  element.textContent = "Thinking...";
}

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  stopSpeech(); // Stop any ongoing speech

  const promptInput = document.getElementById("prompt");
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Please enter a message.");
    return;
  }

  const currentTime = Date.now();
  if (currentTime - lastRequestTime < 2000) {
    alert("Please wait a moment before sending another request.");
    return;
  }

  lastRequestTime = currentTime;

  // User's message
  chatContainer.innerHTML += chatStripe(false, prompt, generateUniqueId());

  // Clear input
  promptInput.value = "";
  promptInput.style.height = "auto";

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Bot's message
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Backend server URLs
  const live = "https://ai-dyslexia.onrender.com";
  const dev = "http://localhost:5000";

  try {
    const response = await fetch(live, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const responseData = await response.json();
      const parsedData = responseData.bot.trim();

      // Display response immediately (no typing animation for dyslexia-friendly)
      messageDiv.innerHTML = parsedData;
      
      // Font size is handled by CSS classes on body element
      // Add action buttons
      addMessageActions(uniqueId);
      
      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
      const errorText = await response.text();
      if (errorText.includes("quota")) {
        messageDiv.innerHTML =
          "Sorry. The AI is temporarily unavailable. We are working to fix this. Please try again soon.";
      } else {
        messageDiv.innerHTML = "Sorry. There was an error. Please try again.";
      }
    }
  } catch (error) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = "Connection error. Please check your internet.";
    console.error(error);
  }
};

// Auto-resize textarea
function autoResizeTextarea() {
  const textarea = document.getElementById("prompt");
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
  // Initialize speech recognition
  initSpeechRecognition();

  // Ensure voices are loaded for text-to-speech
  // Voices may load asynchronously, so we trigger loading early
  if (window.speechSynthesis) {
    // Trigger voice loading (some browsers need this)
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait a bit and try again
        setTimeout(loadVoices, 100);
      }
    };
    
    // Try loading voices immediately
    loadVoices();
    
    // Also listen for when voices become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Voice button
  if (voiceButton) {
    voiceButton.addEventListener("click", toggleVoiceInput);
  }

  // Form submission
  form.addEventListener("submit", handleSubmit);

  // Enter key handling
  const promptInput = document.getElementById("prompt");
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  });

  // Auto-resize textarea
  promptInput.addEventListener("input", autoResizeTextarea);

  // Initial greeting
  const initialMessageId = generateUniqueId();
  const initialMessage =
    "Hello! 👋<br><br>I am your AI helper.<br><br>I write in a way that is easy to read.<br><br>What would you like to know?";
  chatContainer.innerHTML = chatStripe(
    true,
    initialMessage,
    initialMessageId
  );
  
  // Add action buttons to initial message
  setTimeout(() => {
    addMessageActions(initialMessageId);
  }, 100);

  promptInput.focus();
});

// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}
