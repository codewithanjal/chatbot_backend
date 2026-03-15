import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system']
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    messages: [messageSchema]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
