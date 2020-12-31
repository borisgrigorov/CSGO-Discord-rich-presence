const findProcess = require("find-process");
const config = require("./config.json");
const Events = require("events");

module.exports = class CSGO extends (
  Events
) {
  constructor() {
    super();
    this.isCsgoRunning = false;
    setInterval(() => {
      this.getProccesPid();
    }, 3000);
  }

  getActivity(data) {
    if (config.richOutput)
      console.log("PLAYER STATUS: " + data.player.activity);
    if (data.player.activity == "menu") {
      return "menu";
    } else if (data.player.activity == "playing") {
      return "playing";
    }
  }

  async onData(data) {
    this.pid = await this.getProccesPid();
    var currentActivity = this.getActivity(data);
    return {
      activity: currentActivity,
      pid: this.pid,
      game: data,
    };
  }

  async getProccesPid() {
    findProcess(
      "name",
      process.platform == "win32" ? "csgo.exe" : "csgo_linux64"
    ).then(async (list) => {
      if (list.length == 0) {
        if (config.richOutput) console.log("CSGO is not running");
        if (this.isCsgoRunning != false) {
          this.isCsgoRunning = false;
          this.emit("stop");
        }
        return;
      } else {
        if (config.richOutput) console.log("CSGO is running");
        if (this.isCsgoRunning != true) {
          this.isCsgoRunning = true;
          this.emit("running");
        }
      }
    });
  }
};
