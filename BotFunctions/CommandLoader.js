const fs = require('fs');

const loadCommands = (loggedInData, signalRConnection, commandsDir) => {
  const commands = {};
  
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  console.log(`Loading commands from directory: ${commandsDir}`);
  for (const file of commandFiles) {
    const commandName = file.slice(0, -3);
    console.log(`Loading command ${commandName} from ${commandsDir}/${file}`);
    const command = require(`../${commandsDir}/${commandName}`);
    console.log(`Loaded command: ${commandName}`);
    commands[commandName] = command;
  }
  
  commands.loggedInData = loggedInData;
  commands.signalRConnection = signalRConnection;
  
  signalRConnection.on("ReceiveMessage", async (message) => {
    console.log(`Received ${message.messageType} message from ${message.senderId}: ${message.content}`);
    const readMessageData = {
      "senderId": message.senderId,
      "readTime": (new Date(Date.now())).toISOString(),
      "ids": [
        message.id
      ]
    }
    signalRConnection.send("MarkMessagesRead", readMessageData);
  
    if (message.messageType == "Text") {
      if (message.content.startsWith("/")) {
        const commandParts = message.content.slice(1).split(" ");
        const commandName = commandParts[0];
        const commandParams = commandParts.slice(1);
  
        if (commands.hasOwnProperty(commandName)) {
          commands[commandName](signalRConnection, message, loggedInData, commandParams);
        } else {
          console.log(`Unknown command: ${commandName}`);
        }
      }
    }
  });
  
  signalRConnection.on("MessageSent", (data) => {
    console.log(`Sent ${data.messageType} message to ${data.recipientId}: ${data.content}`);
  });
};

module.exports = { loadCommands };