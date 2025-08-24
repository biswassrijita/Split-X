import express from 'express';

const router = express.Router();

function getBotResponse(message) {
  const lowerMessage = (message || '').toLowerCase();
  if (lowerMessage.includes('account') || lowerMessage.includes('create') || lowerMessage.includes('sign up')) {
    return "To create an account, click 'Get Started' and enter your name and email!";
  }
  if (lowerMessage.includes('split') || lowerMessage.includes('work') || lowerMessage.includes('how')) {
    return "Create a group, add expenses, and we'll calculate who owes whom automatically.";
  }
  if (lowerMessage.includes('group') || lowerMessage.includes('friends')) {
    return "Go to Groups and tap 'Create Group'. Add your friends' names and start tracking!";
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('settle') || lowerMessage.includes('upi')) {
    return "We provide suggested settlements so you can quickly transfer the right amounts.";
  }
  if (lowerMessage.includes('free') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    return 'SplitX is free to use. No hidden fees.';
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return 'Ask me about accounts, groups, expenses, or settlements. I am here to help!';
  }
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return 'Hello! 👋 Welcome to SplitX! How can I help today?';
  }
  return 'You can create groups, add expenses, and we compute settlements. Try creating a group!';
}

router.post('/', async (req, res) => {
  const { message } = req.body || {};
  const reply = getBotResponse(message);
  res.json({ reply });
});

export default router;