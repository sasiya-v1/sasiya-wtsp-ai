const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('SASIYA AI WhatsApp Bot is Running on Railway!');
});

app.post('/webhook', async (req, res) => {
  const msg = req.body.Body || '';
  const from = req.body.From || '';
  const language = /[\u0D80-\u0DFF]/.test(msg) ? 'si' : 'en';

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: msg }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const reply = response.data.choices[0].message.content;

    await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        Body: reply,
        From: process.env.TWILIO_PHONE_NUMBER,
        To: from,
      }), {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        }
      });

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`SASIYA AI Bot is running on port ${PORT}`);
});
