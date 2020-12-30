const config = require("./config.json");
const Discord = require("./discord");
const CSGO = require("./csgo");
const { json } = require("express");
const http = require("http");
const discord = new Discord(config.clientId);
const csgo = new CSGO();

server = http.createServer(function (req, res) {
  if (req.method == "POST") {
    console.log("Data received...");
    res.writeHead(200, { "Content-Type": "text/html" });
    var body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      //console.log("DATA FROM CSGO: " + body);
      res.end("");
      onData(body);
    });
  }
});

setInterval(async () => {
  if(csgo.isCsgoRunning == false && discord.loggedIn){
    await discord.clearActivity(csgo.pid);
  }
});

async function onData(data) {
  data = JSON.parse(data);
  var activity = await csgo.onData(data);
  if (!discord.loggedIn) await discord.login(config.clientId);
  await discord.setActivity(activity);
}

server.listen(config.port, config.host, () => {
  console.log("HTTP server running on port " + config.port);
});
