const findProcess = require("find-process");

module.exports = class CSGO {
  constructor() {
    this.isCsgoRunning = false;
    setInterval(async () => {
      await this.getProccesPid();
    }, 5000);
  }

  getActivity(data) {
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
    findProcess("name", "csgo_linux64").then(async (list) => {
      //console.log(list);
      if (list.length == 0) {
        this.isCsgoRunning = false;
        return null;
      } else {
        this.isCsgoRunning = true;
        return list[0].pid;
      }
    });
  }
};
