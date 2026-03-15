import OpenAI from 'openai';
import Chat from '../models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL,
});

export const processChatMessage = async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let chat;
        if (chatId) {
            chat = await Chat.findById(chatId);
            if (!chat) return res.status(404).json({ error: 'Chat not found' });
        } else {
            chat = new Chat({ messages: [] });
        }

        // 1. Add User Message
        chat.messages.push({ role: 'user', content: message });
        
        // 2. Prepare payload for LLM API (send the full context)
        const apiMessages = chat.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // 3. Call public LLM API via OpenAI SDK wrapper
        let botReply;
        try {
            const response = await openai.chat.completions.create({
                model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
                messages: apiMessages,
            });
            botReply = response.choices[0].message.content;
        } catch (apiError) {
            console.error('LLM API Error:', apiError.message);
            if (apiError.status === 401) {
                botReply = "⚠️ **System Message:** Your Groq API key is invalid or has been revoked (this often happens automatically if the key is uploaded to a public GitHub repository). Please generate a new key at console.groq.com and update your backend/.env file.";
            } else {
                botReply = "⚠️ **System Message:** The AI service is currently unavailable. Error: " + apiError.message;
            }
        }

        // 4. Save Assistant Message
        chat.messages.push({ role: 'assistant', content: botReply });
        await chat.save();

        res.json({
            chatId: chat._id,
            reply: botReply,
            messages: chat.messages
        });
    } catch (error) {
        console.error('Error in processChatMessage:', error);
        res.status(500).json({ 
            error: 'Failed to process chat message', 
            details: error.message,
            stack: error.stack
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
};
