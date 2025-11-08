/**
 * InfoGenius AI - Main Script
 * Optimized for performance and scrolling
 */

document.addEventListener("DOMContentLoaded", function() {
    'use strict';
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Chat button functionality
    const startChatButton = document.getElementById("start-chat-button");
    const nameInput = document.getElementById("name");
    
    if (startChatButton && nameInput) {
        const startChat = () => {
            const nameValue = nameInput.value.trim();
            
            if (nameValue === "") {
                alert("Please fill the required field.");
                nameInput.focus();
                return;
            }
            
            if (nameValue !== "Alohomora") {
                alert('Incorrect password!');
                nameInput.focus();
                return;
            }
            
            window.location.href = "https://infogeniusai.vercel.app";
        };
        
        nameInput.addEventListener("keyup", (event) => {
            if (event.key === "Enter") startChat();
        });
        
        startChatButton.addEventListener("click", startChat);
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }
});