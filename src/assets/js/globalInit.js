import global from './globalIP'

//tron
const TronWeb = require('tronweb')

//log
const log = window.require("electron-log");//error, warn, info, verbose, debug, silly

export function initTron(that) {
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider(global.getTronAllIp());
    const solidityNode = new HttpProvider(global.getTronSolidityIp());
    const tronWeb = new TronWeb(fullNode, solidityNode);
    that.$store.commit('initTronWeb', tronWeb)
}

export function initLog() {
    // 日志文件等级，默认值：false
    log.transports.file.level = 'debug';
    // 日志控制台等级，默认值：false
    log.transports.console.level = 'debug';
    // 日志文件名，默认：main.log
    // log.transports.file.fileName = 'main.log';
    // 日志格式，默认：[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}
    // log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
    // 日志大小，默认：1048576（1M），达到最大上限后，备份文件并重命名为：main.old.log，有且仅有一个备份文件
    log.transports.file.maxSize = 10485760;
    // 日志文件位置：C:\Users\%USERPROFILE%\AppData\Roaming\Electron\logs
    // 完整的日志路径：log.transports.file.file，优先级高于 appName、fileName
    let p1 = __dirname;
    if (p1.indexOf("\\node_modules\\") != -1) {
        p1 = __dirname.slice(0, __dirname.indexOf("\\node_modules\\"))
    }
    log.transports.file.file = p1 + "\\logs\\main.log"
    window.logger = log;
}