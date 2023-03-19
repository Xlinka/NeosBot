const { randomUUID } = require("crypto");

module.exports = async function message(signalRConnection, message, loggedInData, commandParams) {
  if (commandParams.length < 2) {
    const sendMessageData = {
      "id": `MSG-${randomUUID()}`,
      "senderId": loggedInData.userId,
      "recipientId": message.senderId,
      "messageType": "Text",
      "sendTime": (new Date(Date.now())).toISOString(),
      "lastUpdateTime": (new Date(Date.now())).toISOString(),
      "content": "Please provide the command in the format: /message <recipient> <message>"
    };
    signalRConnection.send("SendMessage", sendMessageData);
    return;
  }

  const recipient = commandParams[0];
  const messageContent = commandParams.slice(1).join(' ');

  const sendMessageData = {
    "id": `MSG-${randomUUID()}`,
    "senderId": loggedInData.userId,
    "recipientId": recipient,
    "messageType": "Text",
    "sendTime": (new Date(Date.now())).toISOString(),
    "lastUpdateTime": (new Date(Date.now())).toISOString(),
    "content": messageContent
  };
  signalRConnection.send("SendMessage", sendMessageData);
};