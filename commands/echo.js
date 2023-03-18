const { randomUUID } = require("crypto");

module.exports = async function echo(signalRConnection, message, loggedInData) {
  if (!message.content || message.content.trim() === "") {
    console.log("Received null or empty message in echo command.");
    return;
  }

  let sendMessageData = {
    "id": `MSG-${randomUUID()}`,
    "senderId": loggedInData.userId,
    "recipientId": message.senderId,
    "messageType": "Text",
    "sendTime": (new Date(Date.now())).toISOString(),
    "lastUpdateTime": (new Date(Date.now())).toISOString(),
    "content": message.content.slice(6) // remove "/echo " from the beginning of the message
  }

  await signalRConnection.send("SendMessage", sendMessageData);
  console.log(`Echoed message back to ${message.senderId}: ${sendMessageData.content}`);
}