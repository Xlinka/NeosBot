const https = require('https');
const signalR = require("@microsoft/signalr");
const config = require("../config.json");
const baseAPIURL = "api.neos.com";
const GenerateRandomMachineId = require('../BotFunctions/GenerateRandomMachineId');
const { loadCommands } = require('./CommandLoader');

function runAutoFriendAccept(loggedInData) {
  if (config.autoAcceptFriendRequests) {
    console.log("Start auto accept friend requests.");
    const friendList = [];
    const friendRequest = https.request({
      hostname: baseAPIURL,
      path: `/api/users/${loggedInData.userId}/friends`,
      method: "GET",
      headers: {
        "Authorization": loggedInData.fullToken
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        JSON.parse(data).forEach(friend => {
          if (friend.friendStatus == "Requested")
             friendList.push(friend);
        });
        friendList.forEach(friend => {
          friend.friendStatus = "Accepted";
          const updateFriends = https.request({
            hostname: baseAPIURL,
            path: `/api/users/${loggedInData.userId}/friends/${friend.id}`,
            method: "PUT",
            headers: {
              "Authorization": loggedInData.fullToken,
              "Content-Type": "application/json",
              "Content-Length": JSON.stringify(friend).length
            }
          }, (res2) => {
            let data = '';
            res2.on('data', (chunk) => {
              data += chunk;
            });
            res2.on('end', () => {
              if (res2.statusCode == 200) {
                console.log(`Successfully added ${friend.id} as a contact!`);
              } else {
                console.log(`Success HTTP ${res2.statusCode}: ${JSON.stringify(data)}`);
              }
            });
            res2.on('error', (err) => {
              console.log(`Error HTTP ${res2.statusCode}: ${JSON.stringify(err)}`);
            });
          });
          updateFriends.write(JSON.stringify(friend));
          updateFriends.end();
        });
      });
    });
    friendRequest.end();
  }
}

function runStatusUpdate(loggedInData) {
    console.log("Start updating status");
    const statusUpdateData = {
      "onlineStatus": "Online",
      "lastStatusChange": "",
      "compatibilityHash": "mvcontactbot",
      "neosVersion": config.versionName,
      "outputDevice": "Unknown",
      "isMobile": false,
      "currentSessionHidden": false,
      "currentHosting": true,
      "currentSessionAccessLevel": 0
    };
  
    statusUpdateData.lastStatusChange = (new Date(Date.now())).toISOString();
    const updateStatus = https.request({
      hostname: baseAPIURL,
      path: `/api/users/${loggedInData.userId}/status`,
      method: "PUT",
      headers: {
        "Authorization": loggedInData.fullToken,
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(statusUpdateData).length
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode != 200) {
          console.error(data);
        } else {
          console.log("Status update successful!");
        }
      });
    });
    updateStatus.write(JSON.stringify(statusUpdateData));
    updateStatus.end();
  }
async function runSignalR(loggedInData) {
    //Connect to SignalR
    const signalRConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://api.neos.com/hub", {
        headers: {
          "Authorization": loggedInData.fullToken,
          "UID": GenerateRandomMachineId()
        }
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Critical)
      .build()
  
    signalRConnection.start();
    // Call the loadCommands function to load the commands and attach them to the SignalR connection
    loadCommands(loggedInData, signalRConnection, './commands');
   

    }

  module.exports = {
    runAutoFriendAccept,
    runStatusUpdate,
    runSignalR
  };