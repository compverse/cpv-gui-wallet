import Utils from "./utils.js";
import global from './globalIP'

const bip39 = require("bip39");
const bip32 = require("bip32");
const ethers = require('ethers')

//fil
import * as wasm from "@zondax/filecoin-signing-tools/js"

//tron
const TronWeb = require('tronweb')

//生成随机助记词
export function createMnemonic() {
    const MNEMONIC_LEN = 128;
    const generateMnemonic = () => bip39.generateMnemonic(MNEMONIC_LEN);
    let randomMnemonic = generateMnemonic();
    return randomMnemonic;
}

//创建2.0钱包
export function bhpCreateWallet(that, mnemonic) {
    var account2 = ethers.Wallet.fromMnemonic(mnemonic); //可以用助记词和或导入钱包
    that.bhpWalletObj = {
        chainName: "BHP",
        accounts: []
    }
    let bhpObj = {}
    bhpObj["address"] = account2.address;
    if (that.createAddrLabel) {
        bhpObj["name"] = that.createAddrLabel;
    } else {
        bhpObj["name"] = 'ADDR' + account2.address.slice(account2.address.length - 4, account2.address.length);
    }
    bhpObj["asset"] = 0;
    bhpObj["privateKey"] = account2.privateKey;

    let privateKey = Utils.encryptContent(
        bhpObj["privateKey"],
        that.password
    );

    bhpObj["privateKey"] = privateKey;
    that.bhpWalletObj.accounts.push(bhpObj)
}

//创建FIL钱包
export async function filCreateWallet(that, mnemonic) {
    const {
        HttpJsonRpcConnector,
        MnemonicWalletProvider
    } = require('filecoin.js') //防止进页面就卡顿就
    const seed = bip39.mnemonicToSeed(mnemonic);
    const master = bip32.fromSeed(await seed);
    const child = master.derivePath("44'/461'/0'/0/0");
    let privateKey = child.privateKey.toString("hex");
    const connector = new HttpJsonRpcConnector(global.getFilConnector());
    const hdWalletMnemonic = mnemonic;
    const hdWalletPassword = "";
    const hdDerivationPath = `m/44'/461'/0'/0/0`;
    const walletProvider = new MnemonicWalletProvider(
        connector,
        hdWalletMnemonic,
        hdWalletPassword,
        hdDerivationPath
    );
    that.filWalletObj = {
        chainName: "FIL",
        accounts: []
    }
    let addressFIL = await walletProvider.getDefaultAccount();

    let filObj = {}
    filObj["address"] = addressFIL;
    if (that.createAddrLabel) {
        filObj["name"] = that.createAddrLabel;
    } else {
        filObj["name"] = 'ADDR' + addressFIL.slice(addressFIL.length - 4, addressFIL.length);
    }
    filObj["asset"] = 0;
    filObj["privateKey"] = Utils.encryptContent(
        privateKey,
        that.password
    );
    that.filWalletObj.accounts.push(filObj)
}


/**
 * 
 * @param {*} that 
 * @param {String} leadPrivateKey FIL私钥
 */
export async function filLeadPriKey(that, leadPrivateKey) {
    if (leadPrivateKey) {
        leadPrivateKey = leadPrivateKey.replace(/(^\s*)|(\s*$)/g, "") //去两边空格
        that.filWalletObj = {
            chainName: "FIL",
            accounts: []
        }
        let account2FIL
        try {
            account2FIL = wasm.keyRecover(leadPrivateKey);
            let addressFIL = account2FIL.address
            let filObj = {}
            filObj["address"] = addressFIL;
            filObj["name"] = that.newAddrLabel;
            filObj["asset"] = 0;
            filObj["privateKey"] = Utils.encryptContent(
                leadPrivateKey,
                that.password
            );
            that.filWalletObj.accounts.push(filObj)
        } catch (err) {
            that.filWalletObj = {};
            that.$refs.myMsg.openMessage("error", that.$t("comPriKeyInvalid"));
        }
    } else {
        that.$refs.myMsg.openMessage("error", that.$t('comPrkKeyInfo'));
    }

}

/**
 * 
 * @param {*} that 
 * @param {String} leadMnemonic FIL助记词
 */
export async function filLeadMnemonic(that, leadMnemonic) {
    if (leadMnemonic) {
        leadMnemonic = leadMnemonic.replace(/(^\s*)|(\s*$)/g, "") //去两边空格
        that.filWalletObj = {
            chainName: "FIL",
            accounts: []
        }
        let account2FIL
        try {
            account2FIL = wasm.keyRecover(leadMnemonic);
            let addressFIL = account2FIL.address
            let filObj = {}
            filObj["address"] = addressFIL;
            filObj["name"] = that.newAddrLabel;
            filObj["asset"] = 0;
            filObj["privateKey"] = Utils.encryptContent(
                MyPrivateKey,
                that.password
            );
            that.filWalletObj.accounts.push(filObj)
        } catch (err) {
            that.filWalletObj = {};
            that.$refs.myMsg.openMessage("error", that.$t("comPriKeyInvalid"));
        }
    } else {
        that.$refs.myMsg.openMessage("error", that.$t('comPrkKeyInfo'));
    }
}

//私钥导入2.0钱包
export function bhpLeadPriKey(that, leadPrivateKey) {
    if (leadPrivateKey) {
        leadPrivateKey = leadPrivateKey.replace(/(^\s*)|(\s*$)/g, "") //去两边空格

        if (leadPrivateKey.length == 64 || leadPrivateKey.length == 66) { //0x10~0x19可以导入钱包
            if (leadPrivateKey.substr(0, 2) != "0x") {
                leadPrivateKey = "0x" + leadPrivateKey;
            }

            try {
                //要有0x才可以成功导入ETH钱包
                var account2 = new ethers.Wallet(leadPrivateKey);
            } catch (err) {
                that.$refs.myMsg.openMessage("error", that.$t("comPriKeyInvalid"));

            }

            that.bhpWalletObj = {
                chainName: "BHP",
                accounts: []
            }
            let bhpObj = {}
            bhpObj["address"] = account2.address;
            bhpObj["name"] = that.newAddrLabel;
            bhpObj["asset"] = 0;
            bhpObj["privateKey"] = account2.privateKey;

            let privateKey = Utils.encryptContent(
                bhpObj["privateKey"],
                that.password
            );
            bhpObj["privateKey"] = privateKey;
            that.bhpWalletObj.accounts.push(bhpObj)
        } else {
            that.$refs.myMsg.openMessage("error", that.$t("comPriKeyInvalid"));
        }
    } else {
        that.$refs.myMsg.openMessage("error", that.$t("comPrkKeyInfo"));
    }
}

/**
 * 创建Tron账户
 * @param {*} that 
 */
export async function tronCreateAccount(that) {
    TronWeb.createAccount().then((res) => {
        that.tronAccountObj = {
            chainName: "TRON",
            accounts: []
        }

        let tronObj = {}
        tronObj["address"] = TronWeb.address.fromHex(res.address.hex);
        if (that.createAddrLabel) {
            tronObj["name"] = that.createAddrLabel;
        } else {
            tronObj["name"] = 'ADDR' + res.address.hex.slice(res.address.hex.length - 4, res.address.hex.length);
        }
        tronObj["asset"] = 0;
        tronObj["privateKey"] = Utils.encryptContent(
            res.privateKey,
            that.password
        );
        that.tronAccountObj.accounts.push(tronObj)
    }).catch((err) => {
        console.log(err)
        that.$refs.myMsg.openMessage("error", that.$t("cwCreateError"));
    })
}

/**
 * 
 * @param {*} that 
 * @param {String} leadPrivateKey Tron私钥
 */
export function tronLeadPriKey(that, leadPrivateKey) {
    leadPrivateKey = leadPrivateKey.replace(/(^\s*)|(\s*$)/g, "") //去两边空格
    let addressTron = TronWeb.address.fromPrivateKey(leadPrivateKey)
    if (addressTron) {
        that.tronAccountObj = {
            chainName: "TRON",
            accounts: []
        }
        let tronObj = {}
        tronObj["address"] = addressTron;
        if (that.newAddrLabel) {
            tronObj["name"] = that.newAddrLabel;
        }
        tronObj["asset"] = 0;
        tronObj["privateKey"] = Utils.encryptContent(
            leadPrivateKey,
            that.password
        );
        that.tronAccountObj.accounts.push(tronObj)
    } else {
        that.$refs.myMsg.openMessage("error", that.$t("comPriKeyInvalid"));
    }
}