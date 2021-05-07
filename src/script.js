const electron = require('electron');
const fs = require('fs');
const $ = require('jquery');
const remote = electron.remote;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const path = (electron.app || electron.remote.app).getPath('userData')+"/AppStorage"
const load = require('../src/loader.js');


settings = {};

clearRecents = function() {
    fs.readFile(path+"/data.json", 'utf8' , (err, data) => {
        data = JSON.parse(data);
        data.recent = [];
        fs.writeFile(path+"/data.json", JSON.stringify(data), err => {
            console.log("done")
        })
    })
}


openPath = function() {
    console.log(path)
    require('child_process').exec('start '+path);
}

function restartApp() {
    electron.remote.app.relaunch()
    electron.remote.app.exit()
}


saveSettingsFile = function() {
    fs.readFile(path+"/data.json", 'utf8' , (err, data) => {
        data = JSON.parse(data)
        data.settings = settings;
        console.log(data)
        fs.writeFile(path+"/data.json", JSON.stringify(data), err => {
            console.log("Saved!")
        })
    })
}

closeApp = () => {
    if (load.getOnPlayer()) {
        load.exitPlay()
        let w = remote.getCurrentWindow()
        w.close()
    } else {
        let w = remote.getCurrentWindow()
        w.close()
    }
    
}

toggleSetting = function(setting) {
    console.log("CLICK")
    settings[setting] = !settings[setting];
    saveSettingsFile();
}




window.onload=function(){
    // Load main content
    $(function(){
        console.log("hanekawa best girl ;)")
        load.loadHome();
    })
}

