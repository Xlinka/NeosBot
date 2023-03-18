const { randomUUID } = require("crypto");
const https = require('https');
const baseAPIURL = "api.neos.com";

module.exports = async function announcement(signalRConnection, message, loggedInData) {
  if (loggedInData.userId !== "U-xlinka") {
    console.log("Unauthorized user attempted to execute announcement command.");
    return;
  }

  if (!message.content || message.content.trim() === "") {
    console.log("Received null or empty message in announcement command.");
    return;
  }

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
        if (friend.friendStatus === "Accepted" && friend.id !== "U-Neos") {
          friendList.push(friend);
        }
      });

      friendList.forEach(async friend => {
        const sendMessageData = {
          "id": `MSG-${randomUUID()}`,
          "senderId": loggedInData.userId,
          "recipientId": friend.id,
          "messageType": "Text",
          "sendTime": (new Date(Date.now())).toISOString(),
          "lastUpdateTime": (new Date(Date.now())).toISOString(),
          "content": message.content.slice(13) // remove "/announcement " from the beginning of the message
        }

        await signalRConnection.send("SendMessage", sendMessageData);
        console.log(`Sent announcement to ${friend.displayName}: ${sendMessageData.content}`);
      });
    });
  });

  friendRequest.end();
}