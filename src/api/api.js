import axios from 'axios'
import global from '../assets/js/globalIP'
// bhp2.0查询余额
export function bhp2_getBalance(address) {
    return axios.post(global.getIp(), {
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": [address, "latest"],
        "id": 1
    })
}

// fil 验证地址
export function fil_validateaddress(address) {
    return axios.post(global.getFilIp(), {
        "jsonrpc": "2.0",
        "method": "Filecoin.WalletValidateAddress",
        "params": [address],
        "id": 3
    })
}

/**
 * FIL查询交易所在区块高度
 * @param {String} cid 交易ID
 * @returns 
 */
export function fil_stateSearchMsg(cid) {
    return axios.post(global.getFilIp(), {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "Filecoin.StateSearchMsg",
        "params": [{ "/": cid }]
    })
}

/**
 * FIL获取指定高度的区块HASH
 * @param {String} blockHeight 区块高度
 * @returns 
 */
export function fil_chainGetTipSetByHeight(blockHeight) {
    return axios.post(global.getFilIp(), {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "Filecoin.ChainGetTipSetByHeight",
        "params": [blockHeight, []]
    })
}

/**
 * FIL根据区块HASH及交易ID查询交易状态
 * @param {Array} blockHashs 区块HASH
 * @param {String} cid 交易ID
 * @returns 
 */
export function fil_stateReplay(blockHashs, cid) {
    return axios.post(global.getFilIp(), {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "Filecoin.StateReplay",
        "params": [
            blockHashs,
            {
                "/": cid
            }
        ]
    })
}

/**
 * 
 * @param {Object} msg 交易对象
 * @returns 
 */
export function fil_gasEstimateMessageGas(msg) {
    return axios.post(global.getFilIp(), {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "Filecoin.GasEstimateMessageGas",
        "params": [
            msg,
            { MaxFee: "10000000000000000" },
            null
        ]
    })
}