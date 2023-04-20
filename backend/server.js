const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');
const axios = require('axios');
const openaiApiKey = process.env.OPENAI_API_KEY;
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'Public')));
app.use('/Images', express.static('Images'));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'transaction-dashboard')));

app.post('/execute', (req, res) => {
  // You can remove this endpoint if you don't need server-side code execution
});

app.post('/openai', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
      const generatedText = response.data.choices[0].message.content.trim();
      res.json({ text: generatedText });
    } else {
      console.error('Invalid response from OpenAI API:', JSON.stringify(response.data, null, 2));
      res.status(500).json({ error: 'Error: Invalid response from OpenAI API' });
    }    
  } catch (error) {
    console.error('Error calling OpenAI API: ', error);
    console.error('Error details: ', error.response?.data);
    res.status(500).json({ error: 'Error calling OpenAI API', details: error.response?.data });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'transaction-dashboard', 'transaction-dashboard-tests.html'));
});

app.use(express.static(path.join(__dirname, 'Public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'Public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
