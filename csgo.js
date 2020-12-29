const findProcess = require("find-process");

module.exports = class CSGO {
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
        game: data
    };  
  }

  async getProccesPid() {
    findProcess("name", "csgo_linux64").then(async (list) => {
      if(list.length == 0){
          return null;
      }
      else{
          return list[0].pid;
      }
    });
  }
};
