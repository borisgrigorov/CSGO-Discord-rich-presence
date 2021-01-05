const config = require("../config.json");
const Discord = require("./discord");
const CSGO = require("./csgo");
const express = require("express");
const app = express();
const http = require("http");
const discord = new Discord(config.clientId);
const csgo = new CSGO();
const cli = require("./cli");
const path = require("path");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const fs = require("fs");

app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set("views", path.join(__dirname, "static/"));
app.use("/static", express.static(path.join(__dirname, "static")));

var steamApiKey = "";

try {
    var settings = fs.readFileSync("settings.json");
    settings = JSON.parse(settings);
    steamApiKey = settings.steamApiKey;
} catch (e) {}

server = http.createServer(app);

app.get("/home", (req, res) => {
    res.render("home.html", {
        key: steamApiKey,
    });
});
app.get("/", (req, res) => {
    res.redirect("/home");
});

app.post("/saveKey", bodyParser.json(), (req, res) => {
    if (req.body != null && req.body.key != null && req.body.key.length == 32) {
        steamApiKey = req.body.key;
        res.status(200).end();
        cli.writeInfo();
        fs.writeFileSync(
            "settings.json",
            JSON.stringify({
                steamApiKey: steamApiKey,
            })
        );
    } else {
        res.status(400).end();
    }
});

app.post("/", (req, res) => {
    var body = "";
    if (config.richOutput) console.log("Data received...");
    req.on("data", (data) => {
        body += data.toString();
    });
    req.on("end", () => {
        res.status(200).end();
        onData(body);
    });
});
csgo.on("running", async () => {
    await discord.login();
});

csgo.on("stop", async () => {
    //server.close();
    await discord.clearActivity();
});

server.listen(config.port, config.host, () => {
    if (config.richOutput)
        console.log("HTTP server running on port " + config.port);
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

cli.writeInfo(steamApiKey);
if (steamApiKey.length != 32) {
    cli.getApiKey();
}
