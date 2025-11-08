console.log("🔥 Script loaded");
import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;
let lastRequestTime = 0; // Track the time of the last request

// Function to create the typing loader animation
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += ".";

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Function to simulate typing animation for bot responses
function typeText(element, text) {
  element.innerHTML = ""; // Clear the content before typing

  // Create a temporary element to parse HTML content
  const tempElement = document.createElement("div");
  tempElement.innerHTML = text;

  // Iterate through child nodes and append them to the message element with typing animation
  for (let i = 0; i < tempElement.childNodes.length; i++) {
    const node = tempElement.childNodes[i];
    if (node.nodeType === Node.ELEMENT_NODE) {
      // If it's an element node, append a clone of it with typing animation
      const clonedNode = node.cloneNode(true);
      clonedNode.style.display = "none";
      element.appendChild(clonedNode);

      // Apply typing animation effect
      setTimeout(() => {
        clonedNode.style.display = "inline";
      }, i * 20); // Adjust the typing speed (20 milliseconds per character)
    } else if (node.nodeType === Node.TEXT_NODE) {
      // If it's a text node, create a span element for each character to preserve spaces and apply typing animation
      for (let j = 0; j < node.nodeValue.length; j++) {
        const span = document.createElement("span");
        span.textContent = node.nodeValue[j];
        span.style.display = "none";
        element.appendChild(span);

        // Apply typing animation effect
        setTimeout(() => {
          span.style.display = "inline";
        }, (i * node.nodeValue.length + j) * 20); // Adjust the typing speed (20 milliseconds per character)
      }
    }
  }
}

// Generate unique ID for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Function to create the chat stripe (bubble) for each message
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? "ai" : "user"}">
        <div class="chat">
            <div class="profile">
                <img src="${isAi ? bot : user}" alt="${
    isAi ? "bot" : "user"
  }" />
            </div>
            <div class="message" id="${uniqueId}">${value}</div>
        </div>
    </div>
    `;
}

// Handle form submission and chat functionality
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const prompt = data.get("prompt").trim(); // Trim any leading or trailing whitespace

  // Check if the message is empty, if so, do not submit
  if (!prompt) {
    alert("Please enter a message.");
    return;
  }

  const currentTime = Date.now();

  // Check if enough time has passed since the last request (2 seconds in this case)
  if (currentTime - lastRequestTime < 2000) {
    alert("Please wait a moment before sending another request.");
    return;
  }

  // Update the last request time
  lastRequestTime = currentTime;

  // User's chat stripe
  chatContainer.innerHTML += chatStripe(false, prompt);

  // Clear the textarea input
  form.reset();

  // Animate the send icon
  sendIcon.classList.add("animate-send");

  // Animate the send icon
  sendIcon.classList.add("animate-send");

  // Remove the animation class after it ends so it can trigger again next time
  sendIcon.addEventListener(
    "animationend",
    () => {
      sendIcon.classList.remove("animate-send");
    },
    { once: true }
  );

  // Bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // Scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Specific message div for the bot response
  const messageDiv = document.getElementById(uniqueId);

  // Show loading indicator while waiting for response.
  loader(messageDiv);

  // Backend server URLs
  const live = "https://updatedai-x4al.onrender.com";
  const dev = "http://localhost:5000";

  try {
    // Send the user's message to the backend for processing
    const response = await fetch(live, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    // Clear the loading indicator
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      // Parse the bot's response
      const responseData = await response.json();
      const parsedData = responseData.bot.trim(); // Trim any trailing spaces/'\n'

      // Display the bot's response with typing animation
      typeText(messageDiv, parsedData);
    } else {
      const errorText = await response.text();

      // If there's an error, display a message
      if (errorText.includes("quota")) {
        messageDiv.innerHTML =
          "Sorry for the inconvenience! The AI is temporarily unavailable. We are working to get things back up and running. Please try again shortly!";
      } else {
        messageDiv.innerHTML =
          "Apologies, the website has been disabled by Karan Ram.";
      }
    }
  } catch (error) {
    // Handle errors such as network issues
    clearInterval(loadInterval);
    messageDiv.innerHTML = "Disconnected to Database";
    console.error(error);
  }
};

// Event listeners to handle form submission and input behavior
document.addEventListener("DOMContentLoaded", function () {
  const promptInput = document.getElementById("prompt");
  const sendIcon = document.getElementById("sendIcon");

  // Add initial AI greeting message (dyslexia-friendly)
  const initialMessage = "Hello! 👋<br><br>I am your AI helper.<br><br>I write in a way that is easy to read.<br><br>What would you like to know?";
  chatContainer.innerHTML = chatStripe(true, initialMessage, generateUniqueId());

  document.getElementById("prompt").focus();

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  });
});


if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}