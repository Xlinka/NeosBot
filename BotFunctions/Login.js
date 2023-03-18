// login.js

const https = require('https');
const config = require("../config.json");
const baseAPIURL = "api.neos.com";
const signalR = require("@microsoft/signalr");
const GenerateRandomMachineId = require('./GenerateRandomMachineId');

function login(callback) {
  const currentMachineID = GenerateRandomMachineId();

  const loginData = {
    "username": config.username,
    "password": config.password,
    "rememberMe": false,
    "secretMachineId": currentMachineID
  };

  const loginHeaders = {
    "Content-Type": "application/json",
    "Content-Length": JSON.stringify(loginData).length,
    "TOTP": config.TOTP
  };

  let loggedInData = {
    "token": "",
    "userId": "",
    "expiry": "",
    "fullToken": ""
  };

  console.log(`Logging in...`);

  const loginRequest = https.request({
    hostname: baseAPIURL,
    path: "/api/userSessions",
    method: "POST",
    headers: loginHeaders
  }, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const loginResponse = JSON.parse(data);
      loggedInData.token = loginResponse.token;
      loggedInData.userId = loginResponse.userId;
      loggedInData.expiry = loginResponse.expiry;
      loggedInData.fullToken = `neos ${loginResponse.userId}:${loginResponse.token}`;
      if (res.statusCode === 200) {
        console.log(`Successfully logged in!`);
        callback(null, loggedInData);
      } else {
        callback(`Error logging in: HTTP ${res.statusCode}`);
      }
    });
  });

  loginRequest.write(JSON.stringify(loginData));
  loginRequest.end();
}


module.exports = login;
