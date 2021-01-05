const pm2 = require("pm2");

pm2.connect((e) => {
    console.log("\x1b[31m", "Error while connecting to daemon.");
});

pm2.start({
    name: "CSGO Discord rich presence",
    script: "./index.js",
});