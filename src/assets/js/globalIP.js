let bhpIp = "";
let bhpExplorer = "";
let bhpIpTest = "";
let bhpExplorerTest = "";
let filIp = "";
let filToken = "";
let tronIp = "";
let tronSolidityIp = "";

const fs = window.require("fs");

function getChainConfig() {
    let p1 = __dirname;
    if (p1.indexOf("\\node_modules\\") != -1) {
        p1 = __dirname.slice(0, __dirname.indexOf("\\node_modules\\"))
        p1 = p1 + "\\public\\config.json"
    } else {
        p1 = p1 + "\\config.json"
    }

    try {
        let file = fs.readFileSync(p1, "utf8");
        let chainConfig = (JSON.parse(file)).chain;

        chainConfig.forEach(cc => {
            switch (cc.name) {
                case "BHPMain":
                    bhpIp = cc.ip;
                    bhpExplorer = cc.explorer
                    break;
                case "BHPTest":
                    bhpIpTest = cc.ip;
                    bhpExplorerTest = cc.explorer
                    break;
                case "FIL":
                    filIp = cc.ip;
                    filToken = cc.token;
                    break;
                case "TRON":
                    tronIp = cc.ip;
                    tronSolidityIp = cc.solidityIp;
                    break;
                default:
                    break;
            }
        });
    } catch (err) {
        alert("config error")
        console.log(err)
    }
}

var BhpNetIp = ""
var BhpExplorer = ""

function init() {
    let currentNet = localStorage.getItem("network");
    if (currentNet == null || currentNet == "") {
        changeNet("mainNet");
    } else {
        changeNet(currentNet);
    }
}

function changeNet(val) {
    if (val == "testNet") {
        localStorage.setItem("network", "testNet");
        BhpNetIp = bhpIpTest;
        BhpExplorer = bhpExplorerTest;
    } else {
        localStorage.setItem("network", "mainNet");
        BhpNetIp = bhpIp;
        BhpExplorer = bhpExplorer;
    }
}

function getIp() {
    return BhpNetIp;
}

function getExplorer() {
    return BhpExplorer;
}

function getFilIp() {
    return filIp;
}

function getFilConnector() {
    return {
        url: filIp,
        token: filToken
    }
}

function getTronAllIp() {
    return tronIp;
}

function getTronSolidityIp() {
    return tronSolidityIp;
}

export default {
    getChainConfig,
    init,
    changeNet,
    getIp,
    getExplorer,
    getFilIp,
    getFilConnector,
    getTronAllIp,
    getTronSolidityIp
}