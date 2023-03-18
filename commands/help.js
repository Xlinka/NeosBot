const fs = require('fs');
const { randomUUID } = require("crypto");

module.exports = (signalRConnection, message, loggedInData, commandModules) => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  const commandNames = commandFiles.map(file => file.slice(0, -3));
  const allCommands = [...commandNames, ...Object.keys(commandModules)];
  const response = `Available commands:\n${allCommands.join('\n')}`;
  const sendMessageData = {
    "id": `MSG-${randomUUID()}`,
    "senderId": loggedInData.userId,
    "recipientId": message.senderId,
    "messageType": "Text",
    "sendTime": (new Date(Date.now())).toISOString(),
    "lastUpdateTime": (new Date(Date.now())).toISOString(),
    "content": response
  };
  signalRConnection.send("SendMessage", sendMessageData);
};