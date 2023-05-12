import {
    bhp2_getBalance
} from "../../api/api";
import global from './globalIP'

//tron
const TronWeb = require('tronweb')

//转账BHP2.0余额
export function assetes(that, address) {
    bhp2_getBalance(address).then(res => {
        if (res.data.result) {
            that.amount =
                parseInt(res.data.result, 16) / Math.pow(10, 18); //parseInt(xxx,16)16进制转成10进制
        } else {
            that.amount = 0;
        }
    });
}

//查询各个2.0钱包的资产
export async function allAssets2(that) {
    for (let i in that.tableData) {
        await bhp2_getBalance(that.tableData[i].address).then(res => {
            if (res.data.result) {
                that.tableData[i].asset =
                    parseInt(res.data.result, 16) / Math.pow(10, 18); //parseInt(xxx,16)16进制转成10进制
            } else {
                that.tableData[i].asset = 0;
            }
        });
    }
}

/**
 * 查询各个FIL地址的资产
 * @param {*} that 
 */
export async function allAssetsFIL(that) {
    const {
        HttpJsonRpcConnector,
        HttpJsonRpcWalletProvider
    } = require("filecoin.js");
    const connector = new HttpJsonRpcConnector(global.getFilConnector());
    //查询资产
    let rpc = new HttpJsonRpcWalletProvider(connector);
    for (let i in that.tableData) {
        await rpc.getBalance(that.tableData[i].address).then((res) => {
            if (res) {
                that.tableData[i].asset = Math.floor(parseFloat(res / Math.pow(10, 18)) * 10000) / 10000;
            } else {
                that.tableData[i].asset = 0;
            }
        }).catch((err) => {
            window.logger.verbose("allAssetsFIL: ");
            window.logger.error(err);
            //地址未上过链，全节点返回0，轻节点返回错误
            //轻节点错误Error: resolution lookup failed ([address]): resolve address [address]: actor not found
            if (err.toString().indexOf("actor not found") != 1) {
                that.tableData[i].asset = 0;
            }
        });
    }
}

/**
 * 查询指定FIL地址的资产
 * @param {String} address FIL地址
 * @returns 
 */
export async function getFilAsset(address) {
    const {
        HttpJsonRpcConnector,
        HttpJsonRpcWalletProvider
    } = require("filecoin.js");
    const connector = new HttpJsonRpcConnector(global.getFilConnector());
    //查询资产
    let rpc = new HttpJsonRpcWalletProvider(connector);

    return new Promise(function (resolve, reject) {
        rpc.getBalance(address).then((res) => {
            if (res) {
                resolve(res);
            } else {
                resolve(0);
            }
        }).catch((err) => {
            window.logger.verbose("getFilAsset: ");
            window.logger.error(err);
            //地址未上过链，全节点返回0，轻节点返回错误
            //轻节点错误Error: resolution lookup failed ([address]): resolve address [address]: actor not found
            if (err.toString().indexOf("actor not found") != -1) {
                reject(0);
            } else {
                reject(err);
            }
        })
    })
}

/**
 * 查询各TRON地址资产
 * @param {*} that 
 */
export async function allAssetsTron(that) {
    for (let i in that.tableData) {
        that.$store.state.tronWeb.trx.getBalance(that.tableData[i].address).then((res) => {
            if (res) {
                that.tableData[i].asset = Math.floor(parseFloat(res / Math.pow(10, 6)) * 10000) / 10000;
            } else {
                that.tableData[i].asset = 0;
            }
        }).catch((err) => {
            that.tableData[i].asset = 0;
            window.logger.verbose("allAssetsTron: ");
            window.logger.error(err);
        })
    }
}

/**
 * 验证TRON地址
 * @param {String} address 
 */
export function isTronAddress(address) {
    return TronWeb.isAddress(address);
}

/**
 * 查询TRC20
 * @param {String} address 
 */
export async function GetTronContract(that, address) {
    try {
        let hexAddr = "";
        let baseAddr = ""
        if (address.length == 34) {
            hexAddr = address;
            baseAddr = TronWeb.address.toHex(address)
        } else {
            hexAddr = TronWeb.address.fromHex(address)
            baseAddr = address;
        }

        for (let index in that.assetLists) {
            if (that.assetLists[index].address == hexAddr) {
                that.$refs.myMsg.openMessage(
                    "warning",
                    that.$t("asmContractAddrExist")
                );
                that.newAsset = null;
                return;
            }
        }

        let contract = await that.$store.state.tronWeb.contract().at(hexAddr);
        that.$store.state.tronWeb.setAddress(baseAddr)
        let result = await contract.symbol().call();
        that.newAsset.name = result;
        that.newAsset.address = hexAddr;
        result = await contract.decimals().call();
        that.newAsset.decimals = result.toString();
    } catch (err) {
        that.newAsset = null;
        window.logger.verbose("GetTronContract: ");
        window.logger.error(err);
    }
}

/**
 * 
 * @param {*} that 
 * @param {Object} oneTrc20 Trc20资产对象
 * @param {String} address Tron地址
 */
export async function getTronTokenBalance(that, oneTrc20, address) {
    try {
        let contract = await that.$store.state.tronWeb.contract().at(oneTrc20.address);
        that.$store.state.tronWeb.setAddress(address);
        let result = await contract.balanceOf(address).call();
        oneTrc20.allAsset = Math.floor(parseFloat(result.toString() / Math.pow(10, oneTrc20.decimals)) * 10000) / 10000;
    } catch (err) {
        window.logger.verbose("getTronTokenBalance: ");
        window.logger.error(err);
        if (err.toString().indexOf("timeout of 30000ms exceeded") != -1) {
            that.$refs.myMsg.openMessage(
                "warning",
                that.$t("homeRequestTimeout")
            );
        }
    }
}