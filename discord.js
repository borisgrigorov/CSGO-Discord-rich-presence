const DiscordRPC = require("discord-rpc");
const config = require("./config.json");
const request = require("request");
const childProcess = require("child_process");
module.exports = class Discord {
  constructor(clientId) {
    this.clientId = clientId;
    this.loggedIn = false;
    this.activity = "";
    this.activityStartTime = 0;
  }

  async login() {
    this.client = new DiscordRPC.Client({ transport: "ipc" });

    this.client.on("ready", () => {
      if (config.richOutput) console.log("Connected to discord");
    });
    var clientId = this.clientId;
    await this.client.login({ clientId });

    this.client.subscribe("ACTIVITY_JOIN", (data) => {
      try {
        data = Buffer.from(data.secret, "hex").toString("utf8").split("_");
        var startCommand = process.platform == "win32" ? "start" : "xdg-open";
        childProcess.exec(
          startCommand +
            ' "" "steam://joinlobby/730/' +
            data[1] +
            "/" +
            data[0] +
            '"'
        );
      } catch (e) {
        console.log("Could not connect to lobby");
      }
    });

    this.loggedIn = true;
  }

  async clearActivity(pid) {
    if (config.richOutput) console.log("Activity cleared");
    await this.client.clearActivity(pid);
  }

  async setActivity(data) {
    var activity = {};
    if (data.activity != this.activity) {
      this.activityStartTime = Math.round(Date.now() / 1000);
      this.activity = data.activity;
    }
    activity = {
      startTimestamp: this.activityStartTime,
    };
    if (data.activity == "menu") {
      var lobbyid = "-";
      if (data.steamApiKey != "") {
        lobbyid = await this.getSteamLobbyId(
          "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" +
            data.steamApiKey +
            "&steamids=" +
            data.game.provider.steamid
        );
      }
      else{
        lobbyid = "-";
      }
      if (lobbyid == "-") {
        activity.state = "In menu";
      } else {
        activity.state = "In lobby";
        activity.partyId = lobbyid;
        activity.partySize = 1;
        activity.partyMax = 5;
        activity.joinSecret = Buffer.from(
          data.game.provider.steamId + "_" + lobbyid
        )
          .toString("hex")
          .toUpperCase();
      }
      activity.largeImageKey = "menu";
      activity.largeImageText = "Main Menu";
    } else if (data.activity == "playing") {
      activity.state = this.getTeam(data.game);
      activity.details =
        this.getGamePhase(data.game) + " " + this.getCurrentPoints(data.game);
      activity.largeImageKey = data.game.map.name;
      activity.largeImageText = this.betterMapName(data.game.map.name);
      activity.smallImageKey = data.game.map.mode;
      activity.smallImageText = this.getGameMode(data.game.map.mode);
    }
    activity = this.activityModificationByGameMode(activity, data.game);
    await this.client.setActivity(activity, data.pid);
  }

  async getSteamLobbyId(url) {
    return new Promise((resolve, rej) => {
      request(url, { json: true }, (err, res, body) => {
        if (body.response.players[0].lobbysteamid != null) {
          resolve(body.response.players[0].lobbysteamid);
          return;
        } else {
          resolve("-");
          return;
        }
      });
    });
  }

  getGameMode(name) {
    switch (name) {
      case "scrimcomp2v2":
        return "Wingman";
      case "casual":
        return "Casual";
      case "competitive":
        return "Competitive";
      case "deathmatch":
        return "Deathmatch";
      case "gungametrbomb":
        return "Demolition";
      case "flyingscoutsman":
        return "Flying Scoutsman";
      case "Overwatch":
        return "Overwatch";
      case "survival":
        return "Danger zone";
      case "gungameprogressive":
        return "Arms race";
      case "training":
        return "Training";
      default:
        return "Unknown game type";
    }
  }

  getTeam(data) {
    if (data.player.team == "CT") {
      return "Playing as Counter-Terrorists";
    } else if (data.player.team == "T") {
      return "Playing as Terrorists";
    }
  }

  getCurrentPoints(game) {
    return (
      "(CT: " + game.map.team_ct.score + ", T:" + game.map.team_t.score + ")"
    );
  }

  getGamePhase(data) {
    switch (data.map.phase) {
      case "warmup":
        return "Warmup";
      case "live":
        return "In-Game";
      case "intermission":
        return "Half-Time";
      case "gameover":
        return "Game Over";
      default:
        return data.map.phase;
    }
  }

  betterMapName(text) {
    text = text.replace(text.substring(0, 3), "");
    text = this.firstToUpperCase(text);
    return text;
  }

  firstToUpperCase(text) {
    return (text = text.charAt(0).toUpperCase() + text.slice(1));
  }

  activityModificationByGameMode(activity, data) {
    if (data.player.activity == "playing") {
      if (data.map.mode == "survival") {
        activity.details = "Danger zone - " + this.getGamePhase(data);
        activity.state = this.betterMapName(data.map.name);
      } else if (
        data.map.mode == "deathmatch" ||
        data.map.mode == "casual" ||
        data.map.mode == "demolition" ||
        data.map.mode == "gungametrbomb" ||
        data.map.mode == "gungameprogressive"
      ) {
        activity.details = this.firstToUpperCase(
          this.getGameMode(data.map.mode)
        );
        activity.state =
          "Kills: " +
          data.player.match_stats.kills +
          " | Score: " +
          data.player.match_stats.score;
      }
    }
    return activity;
  }
};
