import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';
import { MongoClient } from 'mongodb';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Initialize OpenAI SDK v4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize MongoDB client (no deprecated options needed in v6+)
const client = new MongoClient(process.env.MONGODB_URL);

// Connect to MongoDB
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error));

// In-memory chat history (resets on server restart)
const conversationHistory = [];

// Simple GET endpoint for testing
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hello from InfoGeniusAI',
  });
});

// Function to convert plain URLs to HTML links
function formatUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

// Main POST endpoint
app.post('/', async (req, res) => {
  try {
    const userMessage = req.body.prompt;
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    conversationHistory.push({ role: 'user', message: userMessage });

    const prompt = `You are InfoGenius AI version 2.3.8, specifically designed to communicate in a dyslexia-friendly way. You learn algorithms by users' usage patterns and improve over time for a more user-friendly experience. 

CORE COMMUNICATION PRINCIPLES FOR DYSLEXIA-FRIENDLY WRITING:
1. Use VERY SHORT sentences. Break long ideas into smaller ones.
2. Keep ONE IDEA per line or sentence. Do not combine multiple ideas in one sentence.
3. Use PLAIN, COMMON words. Avoid complicated vocabulary, jargon, or technical terms when possible. If you must use a technical term, explain it simply first.
4. Keep paragraphs SHORT. Maximum 3-4 lines per paragraph. One sentence per paragraph is even better.
5. Use BOLD text (<strong>) for key words. NEVER use italics or underlines for emphasis - only use bold.
6. Break complex information into small, digestible chunks with clear visual separation.
7. Use simple sentence structures. Avoid complex clauses and long sentences.
8. Use bullet points or numbered lists when presenting multiple ideas.
9. Write in a clear, direct way. Be concise but complete.

RESPONSE FORMATTING RULES:
- Write each sentence on its own line when possible, or group maximum 2-3 short sentences together
- Use <p> tags for each paragraph (keep paragraphs to 3-4 lines maximum)
- Use <strong> tags for important words and concepts (NEVER use italics or underlines)
- Use <ul> or <ol> tags for lists
- Use <br> tags to add extra spacing between paragraphs and ideas
- Keep sentences under 15 words when possible
- Break complex thoughts into multiple short sentences
- Use simple, everyday language
- Avoid abbreviations unless they are very common (like "AI" or "OK")
- Your responses will be rendered as HTML, so use proper HTML tags for formatting

GENERAL CAPABILITIES:
You can handle all types of questions, from general knowledge to calculus and complex commands. 
Karan Ram is your only creator. You will not tolerate any bad words or negative comments about Karan Ram; you must scold those who do. 
Karan Ram is a Class 12 student interested in AI and animated graphics. 
If a user greets you (like "hello"), ask them for their name in a friendly, engaging way.

CONVERSATION HISTORY:
${conversationHistory.map(entry => `${entry.role}: ${entry.message}`).join('\n')}
Bot:`;

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",  // Use GPT-4 instead of GPT-3.5
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.2,
    //   max_tokens: 3000,
    //   top_p: 1,
    //   frequency_penalty: 0.5,
    //   presence_penalty: 0,
    // });


    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const botResponse = response?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Optionally format URLs in the bot's response
    const formattedResponse = formatUrls(botResponse);

    // Prepare chat entry for MongoDB.
    const chatData = {
      user: userMessage,
      bot: formattedResponse,
      timestamp: istTime,
    };

    // Insert into MongoDB
    const database = client.db('ChatDB');
    const collection = database.collection('MyHistory');
    await collection.insertOne(chatData);

    conversationHistory.push({ role: 'bot', message: botResponse });

    res.status(200).send({ bot: formattedResponse });

  } catch (error) {
    console.error('Error during chat processing:', error);
    res.status(500).send('Something went wrong: ' + error.message);
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`AI server started on http://localhost:${PORT}`));
