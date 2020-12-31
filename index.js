const config = require("./config.json");
const Discord = require("./discord");
const CSGO = require("./csgo");
const http = require("http");
const discord = new Discord(config.clientId);
const csgo = new CSGO();
const readline = require("readline");
const childProcess = require("child_process");

var steamApiKey = "";

server = http.createServer(function (req, res) {
  if (req.method == "POST") {
    if (config.richOutput) console.log("Data received...");
    res.writeHead(200, { "Content-Type": "text/html" });
    var body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      if (config.richOutput) console.log("DATA FROM CSGO: " + body);
      res.end("");
      onData(body);
    });
  } else if (req.method == "GET") {
    res.end("Working");
  }
});

csgo.on("running", async () => {
  server.listen(config.port, config.host, () => {
    if (config.richOutput)
      console.log("HTTP server running on port " + config.port);
  });
  await discord.login();
});

csgo.on("stop", async () => {
  server.close();
  await discord.clearActivity();
});

async function onData(data) {
  data = JSON.parse(data);
  if (data.auth.token == "cn5s1vf5d64tz54q6w5e1y651grt65e89qe1") {
    var activity = await csgo.onData(data);
    if (!discord.loggedIn) await discord.login(config.clientId);
    activity.steamApiKey = steamApiKey;
    await discord.setActivity(activity);
  } else {
    console.log("\x1b[31m", "Incorrect auth token.", "\x1b[0m");
  }
}

function writeInfo() {
  process.stdout.write("\033c");
  console.log("\x1b[32m", "CS:GO Discord rich presence is running.");
  console.log("\x1b[31m", "Keep this window open.");
  console.log(
    "\x1b[0m",
    "--",
    steamApiKey == "" ? "API key not entered" : "API key entered"
  );
  console.log("\r");
}

writeInfo();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\x1b[36m", "If you want to use in-Discord invites,");
console.log(
  "\x1b[36m",
  "please enter your Steam API key from",
  "\x1b[34m",
  "https://steamcommunity.com/dev/apikey"
);
console.log("\x1b[36m", "for domain name type: 127.0.0.1,");
console.log(
  "\x1b[36m",
  "and hit enter, if you does not want to use discord invite, just hit enter.",
  "\x1b[0m"
);
console.log("\r");
try {
  var startCommand = process.platform == "win32" ? "start" : "xdg-open";
  childProcess.exec(startCommand + " https://steamcommunity.com/dev/apikey");
} catch (e) {}
rl.question("Your API key: ", (key) => {
  rl.close();
  if(key.length == 32){
    steamApiKey = key;
  }
  process.stdout.write("\033c");
  writeInfo();
});
