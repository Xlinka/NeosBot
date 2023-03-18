const axios = require('axios');
const { randomUUID } = require("crypto");
const config = require('../config.json');

module.exports = async function weather(signalRConnection, message, loggedInData, commandParams) {
  if (commandParams.length < 1) {
    // If the user didn't provide a location, send an error message
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": "Please provide a location for the weather in the format: /weather <location>"
    };
    signalRConnection.send("SendMessage", sendMessageData);
    return;
  }

  const location = commandParams.join(' ');
  const apiKey = config.openWeatherMapApiKey;

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
    const temperature = response.data.main.temp;
    const description = response.data.weather[0].description;
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": `Current weather in ${location}: ${description}, ${temperature}°C`
    };
    signalRConnection.send("SendMessage", sendMessageData);
  } catch (error) {
    // If there was an error fetching the weather data, send an error message
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": `Error: ${error.response.data.message}`
    };
    signalRConnection.send("SendMessage", sendMessageData);
  }
};