const config = require("../config.json");
const Discord = require("./discord");
const CSGO = require("./csgo");
const express = require("express");
const expressApp = express();
const http = require("http");
const discord = new Discord(config.clientId);
const csgo = new CSGO();
const cli = require("./cli");
const bodyParser = require("body-parser");
const fs = require("fs");
const { app, BrowserWindow, Menu, Tray } = require("electron");

var steamApiKey = "";

try {
    var settings = fs.readFileSync("settings.json");
    settings = JSON.parse(settings);
    steamApiKey = settings.steamApiKey;
} catch (e) {}

server = http.createServer(expressApp);

expressApp.post("/saveKey", bodyParser.json(), (req, res) => {
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

expressApp.post("/", (req, res) => {
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

/*cli.writeInfo(steamApiKey);
if (steamApiKey.length != 32) {
    cli.getApiKey();
}*/

app.on("ready", () => {
    const icon = "./assets/logo.png";
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            devTools: true,
        },
        center: true,
        minHeight: 550,
        minWidth: 800,
        title: "CS:GO Discord integration",
        icon: icon,
    });
    win.removeMenu();
    win.loadFile("./src/static/home.html");

    win.on("minimize", (event) => {
        event.preventDefault();
        win.hide();
    });

    win.on("close", (event) => {
        event.preventDefault();
        win.hide();
    });
    var contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: () => win.show(),
            role: "unhide",
        },
        {
            label: "Close app",
            click: () => {
                //app.isQuiting = true;
                console.log("Quitting...");
                app.quit();
            },
            role: "quit",
        },
    ]);
    var appIcon = new Tray(icon);
    appIcon.setContextMenu(contextMenu);
    appIcon.setTitle("CS:GO Discord integration");
});
