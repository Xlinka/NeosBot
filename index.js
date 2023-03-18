const login = require("./BotFunctions/Login");
const { runAutoFriendAccept, runStatusUpdate, runSignalR } = require("./BotFunctions/Functions");

login((error, loggedInData, signalRConnection) => {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.log("Logged in successfully.");
    runAutoFriendAccept(loggedInData);
    runStatusUpdate(loggedInData);
    runSignalR(loggedInData, signalRConnection);
    
  }
});