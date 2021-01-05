const childProcess = require("child_process");

module.exports.writeInfo = function writeInfo(steamApiKey) {
    process.stdout.write("\033c");
    console.log("\x1b[32m", "CS:GO Discord rich presence is running.");
    console.log("\x1b[31m", "Keep this window open.");
    console.log(
        "\x1b[0m",
        "--",
        steamApiKey == "" ? "API key not entered" : "API key entered"
    );
    console.log("\r");
};

module.exports.getApiKey = function getApiKey() {
    console.log("\x1b[36m", "If you want to use in-Discord invites, go to http://127.0.0.1:3000/home (this window should open automatically).");
    console.log("\r");
    try {
        var startCommand = process.platform == "win32" ? "start" : "xdg-open";
        childProcess.exec(
            startCommand + " http://127.0.0.1:3000/home"
        );
    } catch (e) {}
};
