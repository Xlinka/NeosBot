const axios = require('axios');
const { randomUUID } = require("crypto");

module.exports = async function joke(signalRConnection, message, loggedInData) {
  try {
    const response = await axios.get('https://v2.jokeapi.dev/joke/Any');
    const joke = response.data.type === 'single' ? response.data.joke : `${response.data.setup}\n${response.data.delivery}`;
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": joke
    };
    signalRConnection.send("SendMessage", sendMessageData);
  } catch (error) {
    // If there was an error fetching the joke, send an error message
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": "Sorry, I couldn't find any jokes right now."
    };
    signalRConnection.send("SendMessage", sendMessageData);
  }
};