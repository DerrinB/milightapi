//   _____                 _         __ __   __  
//  |  __ \               (_)       / //_ | / /  
//  | |  | | ___ _ __ _ __ _ _ __  / /_ | |/ /_  
//  | |  | |/ _ \ '__| '__| | '_ \| '_ \| | '_ \ 
//  | |__| |  __/ |  | |  | | | | | (_) | | (_) |
//  |_____/ \___|_|  |_|  |_|_| |_|\___/|_|\___/ 

//MilightAPI by @Derrin616 Development

var apiKey = "baj@jkajbaJJ";
var homeKitCode = "678-90-879"

var SelfReloadJSON = require('self-reload-json');
var zonefile = new SelfReloadJSON(__dirname + '/zone.json'); //zoneFile
var fs = require('file-system'); //Om files te editen
var color = ""; //Zo leeglaten
var express = require("express"); //Zorgt voor de webserver
app = express();
const WebSocket = require('ws');
var colorsys = require('colorsys')
var Milight = require('node-milight-promise'); //Milight API
var exec = require('child_process').exec;
const token = "84e56c0b-44de-411c-ab49-c419f7214eef";
var IP = "192.168.10.178"; //IP van de iBox
var Color = require('color');

var light = new Milight.MilightController({
    ip: IP,
    type: 'v6'
});
zone = zonefile.zone1;
var commands = Milight.commandsV6;

const options = {
    headers: {
        "Authorization": Buffer.from("apikey:" + token).toString('base64')
    }
};

// Keep live and detect disconnection
function heartbeat() {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
        console.log("No Connection. Killing node...")
        this.terminate();
    }, 30000 + 1000);
}

function getTime1() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }
  
  //Logs system
  var logStr = "";
  function log(logLine) {
    logStr += logLine + "\n";
    console.log(logLine);
  }

const ws = new WebSocket('ws://iot.sinric.com', options);

ws.on('open', heartbeat);
ws.on('ping', heartbeat);
ws.on('close', function clear() {
    console.log("WebSocket closed restarting Wings!");
    exec("sudo systemctl restart wings");
});

ws.on('open', function open() {
    console.log("Connected. waiting for commands..");
});

ws.on('message', function incoming(data) {
    console.log("Request : " + data)
    let cmdObj = JSON.parse(data);

    if (cmdObj.action == "setPowerState") {
        if (cmdObj.value === "ON") {
            if (cmdObj.deviceId === "5dd94673478df635925f76e1") {
                //Ledstrip Desk
                light.sendCommands(commands.rgbw.on(1));
            } else if (cmdObj.deviceId === "5e70c70c28848668072d5181") {
                //Ledstrip Bed
                light.sendCommands(commands.rgbw.on(2));
            } else if (cmdObj.deviceId === "5e71197128848668072d71ff") {
                //The Lights
                light.sendCommands(commands.rgbw.on(0));
		light.sendCommands(commands.fullColor.on(0));
            } else if (cmdObj.deviceId === "5e70bd4328848668072d4db5") {
                //iBox
                light.sendCommands(commands.bridge.on());
            }
        } else {
            if (cmdObj.deviceId === "5dd94673478df635925f76e1") {
                //Ledstrip Desk
                light.sendCommands(commands.rgbw.off(1));
            } else if (cmdObj.deviceId === "5e70c70c28848668072d5181") {
                //Ledstrip Bed
                light.sendCommands(commands.rgbw.off(2));
            } else if (cmdObj.deviceId === "5e71197128848668072d71ff") {
                //The Lights
                light.sendCommands(commands.rgbw.off(0));
		light.sendCommands(commands.fullColor.off(0));
            } else if (cmdObj.deviceId === "5e70bd4328848668072d4db5") {
                //iBox
                light.sendCommands(commands.bridge.off());
            }
        }
    } else if (cmdObj.action === "SetColor") {
        if (cmdObj.deviceId === "5dd94673478df635925f76e1") {
            //Ledstrip Desk
            setColor(cmdObj.value["hue"], cmdObj.value["saturation"], cmdObj.value["brightness"], 1, false);
        } else if (cmdObj.deviceId === "5e70c70c28848668072d5181") {
            //Ledstrip Bed
            setColor(cmdObj.value["hue"], cmdObj.value["saturation"], cmdObj.value["brightness"], 2, false);
        } else if (cmdObj.deviceId === "5e71197128848668072d71ff") {
            //The Lights
            setColor(cmdObj.value["hue"], cmdObj.value["saturation"], cmdObj.value["brightness"], 0, false);
        } else if (cmdObj.deviceId === "5e70bd4328848668072d4db5") {
            //iBox
            setColor(cmdObj.value["hue"], cmdObj.value["saturation"], cmdObj.value["brightness"], 0, true);
        }
    } else if (cmdObj.action === "SetColorTemperature") {
        if (cmdObj.deviceId === "5dd94673478df635925f76e1") {
            //Ledstrip Desk
            if (cmdObj.value === 4000) {
                light.sendCommands(commands.rgbw.whiteMode(1));
            }
        } else if (cmdObj.deviceId === "5e70c70c28848668072d5181") {
            //Ledstrip Bed
            if (cmdObj.value === 4000) {
                light.sendCommands(commands.rgbw.whiteMode(2));
            }
        } else if (cmdObj.deviceId === "5e71197128848668072d71ff") {
            //The Lights
            if (cmdObj.value === 4000) {
                light.sendCommands(commands.rgbw.whiteMode(0));
		light.sendCommands(commands.fullColor.whiteMode(0));
            }
        } else if (cmdObj.deviceId === "5e70bd4328848668072d4db5") {
            //iBox
            if (cmdObj.value === 4000) {
                light.sendCommands(commands.bridge.whiteMode());
            }
        }
    } else if (cmdObj.action === "SetBrightness") {
        if (cmdObj.deviceId === "5dd94673478df635925f76e1") {
            //Ledstrip Desk
            light.sendCommands(commands.rgbw.brightness(1, cmdObj.value));
        } else if (cmdObj.deviceId === "5e70c70c28848668072d5181") {
            //Ledstrip Bed
            light.sendCommands(commands.rgbw.brightness(2, cmdObj.value));
        } else if (cmdObj.deviceId === "5e71197128848668072d71ff") {
            //The Lights
            light.sendCommands(commands.rgbw.brightness(0, cmdObj.value));
	    light.sendCommands(commands.fullColor.brightness(0, cmdObj.value));
        } else if (cmdObj.deviceId === "5e70bd4328848668072d4db5") {
            //iBox
            light.sendCommands(commands.bridge.brightness(cmdObj.value));
        }
    }
});

function setColor(hue, saturation, brightness, zone, isBridge) {
    var rgb = colorsys.hsv_to_rgb(Math.round(hue), Math.round(saturation * 100), Math.round(brightness * 100));

    if(isBridge == true){
        light.sendCommands(commands.bridge.rgb(rgb.r, rgb.g, rgb.b));
    } else {
        light.sendCommands(commands.fullColor.rgb(zone, rgb.r, rgb.g, rgb.b));
    }
    
}


  
  //De API
  app.get("/", function (req, res) {
  
    if (req.query.apikey != null && req.query.apikey == apiKey) {
      //res.writeHead(200);
      if (req.query.action != "" && req.query.action != null) {
        if (req.query.action == "off") {
          log("Lampen worden\x1b[36m uit\x1b[37m gezet in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
          new Promise(function () {
            light.sendCommands(commands.rgbw.off(zone));
	    light.sendCommands(commands.fullColor.off(zone));
          });
        } else if (req.query.action == "on") {
          log("Lampen worden\x1b[36m aan\x1b[37m gezet in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
          new Promise(function () {
            light.sendCommands(commands.rgbw.on(zone));
 	    light.sendCommands(commands.fullColor.on(zone));
          });
        } else if (req.query.action == "white") {
          log("Lampen worden naar\x1b[36m wit\x1b[37m gezet in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
          new Promise(function () {
            light.sendCommands(commands.rgbw.whiteMode(zone));
	    light.sendCommands(commands.fullColor.whiteMode(zone));
          });
        } else if (req.query.action == "night") {
          log("Lampen worden naar\x1b[36m nacht\x1b[37m gezet in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
          new Promise(function () {
            light.sendCommands(commands.rgbw.nightMode(zone));
	    light.sendCommands(commands.fullColor.nightMode(zone));
          });
        } else if (req.query.action == "color") {
          if (req.query.value != "") {
            var value = req.query.value;
            color = Color("#" + value);
            log("Lampen worden naar de HEX kleur\x1b[36m #" + value + "\x1b[37m gezet in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
            new Promise(function () {
              light.sendCommands(commands.fullColor.rgb(zone, color.red(), color.green(), color.blue()));
            });
          }
        } else if (req.query.action == "brightness") {
          if (req.query.value != "") {
            var value = req.query.value;
            log("Lampen word gedimt naar\x1b[36m " + value + "%\x1b[37m in zone " + zone + "! |\x1b[36m " + getTime1() + "\x1b[37m");
            new Promise(function () {
              light.sendCommands(commands.rgbw.brightness(zone, value));
	      light.sendCommands(commands.rgb.brightness(zone, value));
            });
          }
        } else if (req.query.action == "zone") {
          if (req.query.value != "") {
            var value = req.query.value;
            log("Zone word gezet naar\x1b[36m " + value + "\x1b[37m! |\x1b[36m " + getTime1() + "\x1b[37m");
            new Promise(function () {
              fs.writeFile('zone.json', `{"zone1":"` + value + `"}`);
            });
          }
        }
      }
      res.end();
    }
  });
  
  //Log System
  app.get("/logs", function (req, res) {
    var l = logStr.split("\n").join("<br/>");
    var remove = false;
    var result = "";
    for (i = 0; i < l.length; i++) {
      if (l[i] == "\x1b") {
        remove = true;
      }
      if (!remove) {
        result += l[i];
      }
      if (l[i] == 'm') {
        remove = false;
      }
    }
    res.send(result);
  });
  
  app.listen(8080);
  log("Server staat aan op poort:\x1b[36m 8080\x1b[37m |\x1b[36m " + getTime1() + "\x1b[37m");

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `${f(0)}${f(8)}${f(4)}`;
  }

var Hue = null;
var Sat = null;
  function setColor2(){
    if(Hue != null) {
        if(Sat != null) {
            if(Hue == 0 && Sat == 0){
                request("http://192.168.10.189:8080/?action=white&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");  
            } else {

            
            colorHex = hslToHex(Hue, Sat, 50);
            request("http://192.168.10.189:8080/?action=color&value="+colorHex+"&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");

            Hue = null;
            Sat = null;
            }
        }
    }
  }

const hap = require("hap-nodejs");
const request = require('request');
const { DataStreamHAPTransportInterrupt } = require("hap-nodejs/dist/lib/gen/HomeKit");

const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const CharacteristicEventTypes = hap.CharacteristicEventTypes;
const Service = hap.Service;

// optionally set a different storage location with code below
// hap.HAPStorage.setCustomStoragePath("...");

const accessoryUuid = hap.uuid.generate("hap.examples.light");
const accessory = new Accessory("Ledstrips", accessoryUuid);

const lightService = new Service.Lightbulb("Example Lightbulb");

let currentLightState = false; // on or off
let currentBrightnessLevel = 100;
let currentHueLevel = 0;
let currentSatLevel = 0;
let colortemp = 0;


// 'On' characteristic is required for the light service
const onCharacteristic = lightService.getCharacteristic(Characteristic.On);
// 'Brightness' characteristic is optional for the light service; 'getCharacteristic' will automatically add it to the service!
const brightnessCharacteristic = lightService.getCharacteristic(Characteristic.Brightness);

const hueCharacteristic = lightService.getCharacteristic(Characteristic.Hue);
const saturationCharacteristic = lightService.getCharacteristic(Characteristic.Saturation);
const colortempCharacteristic = lightService.getCharacteristic(Characteristic.ColorTemperature);


// with the 'on' function we can add event handlers for different events, mainly the 'get' and 'set' event
onCharacteristic.on(CharacteristicEventTypes.GET, callback => {
  console.log("Queried current light state: " + currentLightState);
  callback(undefined, currentLightState);
});
onCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
  console.log("Setting light state to: " + value);

  if(value == true) {
request("http://192.168.10.189:8080/?action=on&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
  } else {
    request("http://192.168.10.189:8080/?action=off&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
  }
  currentLightState = value;
  callback();
});


brightnessCharacteristic.on(CharacteristicEventTypes.GET, (callback) => {
  console.log("Queried current brightness level: " + currentBrightnessLevel);
  callback(undefined, currentBrightnessLevel);
});
brightnessCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
  console.log("Setting brightness level to: " + value);

  request("http://192.168.10.189:8080/?action=brightness&value="+value+"&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
  currentBrightnessLevel = value;
  callback();
});


hueCharacteristic.on(CharacteristicEventTypes.GET, (callback) => {
    //console.log("Queried current brightness level: " + currentBrightnessLevel);
    callback(undefined, currentHueLevel);
  });

hueCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
    console.log("Setting hue level to: " + value);
    Hue = value;
    setTimeout(() => {
        setColor2(); 
    }, 250);
    
    //request("http://192.168.10.189:8080/?action=brightness&value="+value+"&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
    //currentBrightnessLevel = value;
    callback();
  });

  saturationCharacteristic.on(CharacteristicEventTypes.GET, (callback) => {
    //console.log("Queried current brightness level: " + currentBrightnessLevel);
    callback(undefined, currentSatLevel);
  });

saturationCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
    console.log("Setting sat level to: " + value);
    Sat = value;
    //request("http://192.168.10.189:8080/?action=brightness&value="+value+"&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
    //currentBrightnessLevel = value;
    callback();
  });

  colortempCharacteristic.on(CharacteristicEventTypes.GET, (callback) => {
    //console.log("Queried current brightness level: " + currentBrightnessLevel);
    callback(undefined, colortemp);
  });

colortempCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
    console.log("Setting colortemp level to: " + value);
  
    //request("http://192.168.10.189:8080/?action=brightness&value="+value+"&apikey=dbjaHvh.dhaH(VHVDVH%KVdaqvKVH@KVHckCKHKckd");
    //currentBrightnessLevel = value;
    callback();
  });


accessory.addService(lightService); // adding the service to the accessory

// once everything is set up, we publish the accessory. Publish should always be the last step!
accessory.publish({
  username: "17:51:07:F4:BC:7B",
  pincode: "678-90-879",
  port: 47129,
  category: hap.Categories.LIGHTBULB, // value here defines the symbol shown in the pairing screen
});

console.log("Accessory setup finished!");


