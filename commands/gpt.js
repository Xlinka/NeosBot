const axios = require('axios');
const { randomUUID } = require("crypto");
const config = require('../config.json');

module.exports = async function gpt(signalRConnection, message, loggedInData, commandParams) {
  if (commandParams.length < 1) {
    // If the user didn't provide the prompt, send an error message
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": "Please provide a prompt for the GPT-3 AI to generate text from."
    };
    signalRConnection.send("SendMessage", sendMessageData);
    return;
  }

  const prompt = commandParams.join(' ');
  const apiURL = "https://api.openai.com/v1/completions";
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.gptApiKey}`
  };
  const requestBody = {
    prompt: prompt,
    model: 'text-davinci-003',
    max_tokens: 4000,
    temperature: 1.0
  };

  try {
    const response = await axios.post(apiURL, requestBody, { headers: headers });
    const output = response.data.choices[0].text;
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": output
    };
    signalRConnection.send("SendMessage", sendMessageData);
  } catch (error) {
    // If there was an error fetching the text, send an error message
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": "Sorry, there was an error generating text using the GPT-3 AI."
    };
    signalRConnection.send("SendMessage", sendMessageData);
  }
};
