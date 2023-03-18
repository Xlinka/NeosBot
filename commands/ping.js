const { randomUUID } = require("crypto");

module.exports = async function ping(signalRConnection, message, loggedInData) {
  let currentTime = Date.now();

  // Send initial message
  let initialMessageData = {
    "id": `MSG-${randomUUID()}`,
    "senderId": loggedInData.userId,
    "recipientId": message.senderId,
    "messageType": "Text",
    "sendTime": (new Date(currentTime)).toISOString(),
    "lastUpdateTime": (new Date(currentTime)).toISOString(),
    "content": "Pinging..."
  }
  await signalRConnection.send("SendMessage", initialMessageData);

  let responseTime = Date.now();
  let latency = responseTime - currentTime;

  // Send the latency result back to the user
  let sendMessageData = {
    "id": `MSG-${randomUUID()}`,
    "senderId": loggedInData.userId,
    "recipientId": message.senderId,
    "messageType": "Text",
    "sendTime": (new Date(responseTime)).toISOString(),
    "lastUpdateTime": (new Date(responseTime)).toISOString(),
    "content": `Pong! Latency is ${latency}ms.`
  }

  signalRConnection.send("SendMessage", sendMessageData);
}