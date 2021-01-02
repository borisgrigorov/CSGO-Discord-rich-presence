# CS:GO Discord rich presence
### Fetures

**This is 100% VAC Secure**, it's using [official Game State Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration).

 - Show current game info from CS:GO in Discord, in wingman/competitive shows current game state (Warm up/In-Game/Game-Over), points for CTs and Ts, and what team is player playing on, it also shows the current map for all officially supported maps. In deathmatch it's shown current kills and score, also the 
 - You can also send invites to CS:GO lobby via Discord, but you have to provide your steam API key to make this working (After launching app, you will be asked). Your friends on Discord also can ask you to join your lobby.
 - [Installation guide here](#installation)

## Screenshots
![](https://raw.githubusercontent.com/borisgrigorov/CSGO-Discord-rich-presence/master/screenshots/1.png)

![](https://raw.githubusercontent.com/borisgrigorov/CSGO-Discord-rich-presence/master/screenshots/3.png)

![](https://raw.githubusercontent.com/borisgrigorov/CSGO-Discord-rich-presence/master/screenshots/4.png)

## Installation
Supported platform are Windows and Linux.

### Linux
 1. Download the newest release for linux and *gamestate_integration_discord.cfg* file from [here](https://github.com/borisgrigorov/CSGO-Discord-rich-presence/releases)
 2. Move *gamestate_integration_discord.cfg* file to cfgs folder (usually */home/username/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive/csgo/cfg*)
 3. Run the file (*csgo-rich-presence-linux*)
 4. Enjoy!

### Windows
 1. Download the newest release for windows (*csgo-rich-presence-win.exe*) and *gamestate_integration_discord.cfg* file from [here](https://github.com/borisgrigorov/CSGO-Discord-rich-presence/releases)
 2. Move *gamestate_integration_discord.cfg* file to cfgs folder (usually *C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\csgo\cfg*)
 3. Run the exe (*csgo-rich-presence-win.exe*)
 4. Enjoy!
 

### Or for advanced users (Both platforms):

You have to have installed Nodejs and NPM.
 1. Clone repository
 2. Move *gamestate_integration_discord.cfg* to cfgs folder.
 2. run `npm install`
 3. run `npm start`