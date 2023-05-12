<template>
  <div class="batch-trans">
    <div class="mask" v-show="showStop">
      <div class="mask-container">
        <div class="top-gif">
          <img src="../assets/img/loading.gif" alt="" />
        </div>
        <div class="content">
          <h2>{{ $t("bsTransferring") }}</h2>
          <p>{{ $t("bsTransferringMsg") }}</p>
        </div>
        <div class="stop-btn" @click="stopTransfer()">
          <el-button>{{ $t("transStopTrans") }}</el-button>
        </div>
      </div>
    </div>
    <div class="batch-top">
      <div class="container">
        <div>
          <span class="top-label label1">{{ $t("btTransCoin") }}</span>
          <span class="top-label label2">{{ $t("transFromAddr") }}</span>
          <span v-if="transCoin == 'TRON'" class="top-label">
            {{ $t("bsTronGasLimit") }}
          </span>
        </div>
        <div class="content">
          <img
            v-if="transCoin == 'FIL'"
            class="select-before"
            src="../assets/img/coinFil.png"
            alt=""
          />
          <img
            v-else-if="transCoin == 'TRON'"
            class="select-before"
            src="../assets/img/coinTron.png"
            alt=""
          />
          <el-select class="top-coin" v-model="transCoin" @change="changeCoin">
            <el-option label="FIL" value="FIL">
              <img src="../assets/img/coinFil.png" alt="" />FIL
            </el-option>
            <el-option label="TRC20-USDT" value="TRON">
              <img src="../assets/img/coinTron.png" alt="" />TRC20-USDT
            </el-option>
          </el-select>
          <el-select
            class="top-addr"
            v-model="fromAddress"
            :placeholder="$t('transSelect')"
          >
            <el-option
              v-for="(item, i) of walletList"
              :key="i"
              :label="'(' + item.name + ') ' + item.address"
              :value="item.address"
            >
            </el-option>
          </el-select>
          <el-input
            v-if="transCoin == 'TRON'"
            class="top-limit"
            v-model="tronLimit"
            @blur="checkLimit()"
          >
            <template slot="append">TRX</template>
          </el-input>
        </div>
        <div class="option-file">
          <div class="option-btn" @click="importFile()">
            <img src="../assets/img/importFile.png" alt="" />
            {{ $t("btImport") }}
          </div>
          <div class="option-btn" @click="downTemplate()">
            <img src="../assets/img/downFile.png" alt="" />
            {{ $t("btExport") }}
          </div>
        </div>
      </div>
    </div>
    <el-table
      ref="tableList"
      class="batch-table"
      :data="tableData"
      :show-overflow-tooltip="true"
      height="100%"
    >
      <el-table-column label="" width="58px">
        <template slot-scope="scope">
          <!-- 0：等待中，1：排队中，2：成功，3：异常，4：上链失败/资金不足 -->
          <img
            v-if="scope.row.state == 0"
            src="../assets/img/batchTransWait.png"
            alt=""
          />
          <img
            v-else-if="scope.row.state == 1"
            src="../assets/img/batchTransProcess.png"
            alt=""
          />
          <img
            v-else-if="scope.row.state == 2"
            src="../assets/img/batchTransSuccess.png"
            alt=""
          />
          <img
            v-else-if="scope.row.state == 3"
            src="../assets/img/batchTransWarn.png"
            alt=""
          />
          <img
            v-else-if="scope.row.state == 4"
            src="../assets/img/batchTransFailed.png"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="toAddress"
        :label="$t('transfToAddr')"
        width="350px"
      >
      </el-table-column>
      <el-table-column
        prop="toNum"
        :label="$t('transNum')"
        width="110px"
      ></el-table-column>
      <el-table-column v-if="transCoin == 'FIL'" prop="txid" label="cid">
      </el-table-column>
      <el-table-column v-else-if="transCoin == 'TRON'" prop="txid" label="txId">
      </el-table-column>
    </el-table>
    <div class="bottom-btn">
      <el-button @click="startBatchTrans()">{{ $t("btStartTrans") }}</el-button>
      <el-button @click="exportTransResult()" class="btn2">
        {{ $t("bsExportTransResult") }}
      </el-button>
    </div>

    <el-dialog
      :title="$t('comPasswordP')"
      :visible.sync="showPw"
      :before-close="closePassword"
      :close-on-click-modal="false"
    >
      <el-input v-model="password" type="password"></el-input>
      <span slot="footer">
        <el-button class="btn-cancel" @click="closePassword()">
          {{ $t("comCancel") }}</el-button
        >
        <el-button @click="surePassword()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
const { remote } = window.require("electron");
const { dialog } = remote;
const fs = window.require("fs");
import Utils from "../assets/js/utils.js";
import global from "../assets/js/globalIP";
import { getFilAsset } from "../assets/js/myWallet";
import {
  fil_stateSearchMsg,
  fil_chainGetTipSetByHeight,
  fil_stateReplay,
  fil_gasEstimateMessageGas,
} from "../api/api";

import BigNumber from "bignumber.js";
//fil
import * as wasm from "@zondax/filecoin-signing-tools/js";
const { HttpJsonRpcConnector, LightWalletProvider } = require("filecoin.js"); //防止进页面就卡顿就
const connector = new HttpJsonRpcConnector(global.getFilConnector());
const walletProvider = new LightWalletProvider(connector);
//tron
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider(global.getTronAllIp());
const solidityNode = new HttpProvider(global.getTronSolidityIp());

export default {
  data() {
    return {
      fromAddress: "",
      transCoin: "FIL",
      walletList: [],
      tableData: [],
      filePath: "",
      privateKey: "",
      password: "",
      showPw: false,
      showStop: false,
      // batchTransTimer: "",
      // checkTxStateTimer: "",
      // isTrans: false,
      transIndex: -1,
      transExportTxPath: "",
      accuracyFil: "1000000000000000000",
      accuracyTrx: "1000000",
      // trc20USDT: "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL",//NILE TESTNET//4170082243784dcdf3042034e7b044d6d342a91360
      trc20USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", //MAIN NET//41a614f803b6fd780986a42c78ec9c7f77e6ded13c
      // accuracyTrc20Usdt: "1000000000000000000",//NILE TESTNET
      accuracyTrc20Usdt: "1000000", //MAIN NET
      tronLimit: 10,
      tronLimitBig: 10000000,
      tronWeb: null,
    };
  },
  created() {
    let arr = JSON.parse(sessionStorage.getItem("bhpWalletList"));
    for (let i in arr) {
      switch (arr[i].chainName) {
        case "FIL":
          this.walletList = arr[i].accounts;
          break;
      }
    }
    if (this.walletList.length > 0) {
      this.fromAddress = this.walletList[0].address;
    }
  },
  methods: {
    closePassword() {
      this.showPw = false;
      this.password = "";
    },
    changeCoin(val) {
      this.walletList = [];
      this.tableData = [];
      this.tronLimit = 10;
      this.tronLimitBig = 10000000;

      let arr = JSON.parse(sessionStorage.getItem("bhpWalletList"));
      for (let i in arr) {
        if (val == arr[i].chainName) {
          this.walletList = arr[i].accounts;
          break;
        }
      }
      if (this.walletList.length > 0) {
        this.fromAddress = this.walletList[0].address;
      }
    },
    checkLimit() {
      this.tronLimit =
        this.tronLimit.toString().match(/^\d*(\.?\d{0,6})/g)[0] || 10; //只能是最多四位小数的整数或小数
      if (this.tronLimit == 0) this.tronLimit = 10;
      this.tronLimitBig = new BigNumber(this.tronLimit)
        .multipliedBy(this.accuracyTrx)
        .toFixed();
    },
    importFile() {
      let that = this;
      dialog
        .showOpenDialog({
          title: that.$t("bsChooseFile"),
          defaultPath: "/",
          filters: [
            {
              name: "TXT",
              extensions: ["txt"],
            },
          ],
        })
        .then(function (res) {
          if (res.filePaths[0] != undefined) {
            that.tableData = [];
            that.filePath = res.filePaths[0];
            let file = fs.readFileSync(res.filePaths[0], "utf8");
            let data = file.split(/[,，\r\n]/);
            let newArr = data.filter((i) => i && i.trim());

            if (newArr.length % 2 == 0) {
              for (let i = 0; i < newArr.length; i = i + 2) {
                that.tableData.push({
                  state: 0,
                  toAddress: newArr[i],
                  toNum: newArr[i + 1],
                  txid: "",
                });
              }
            } else {
              that.$refs.myMsg.openMessage("error", that.$t("bsInvalidFile"));
            }
          }
        })
        .catch(function (err) {
          window.logger.verbose("Batch Transfer: importFile - ");
          window.logger.error(err);
          that.$refs.myMsg.openMessage("error", err);
        });
    },
    downTemplate() {
      this.downFile("xxx,1");
    },
    downFile(val) {
      let that = this;
      dialog
        .showSaveDialog({
          title: that.$t("bsChooseFilePath"),
          defaultPath: "/",
          filters: [
            {
              name: "TXT",
              extensions: ["txt"],
            },
          ],
        })
        .then(function (res) {
          if (res.filePath != "") {
            fs.writeFile(res.filePath, val, (err) => {
              if (err) {
                window.logger.verbose("Batch Transfer: downFile - ");
                window.logger.error(err);
                that.$refs.myMsg.openMessage("error", err);
              } else {
                that.$refs.myMsg.openMessage(
                  "success",
                  that.$t("bsDownSuccess")
                );
              }
            });
          }
        })
        .catch(function (err) {
          window.logger.verbose("Batch Transfer: downFile catch - ");
          window.logger.error(err);
          that.$refs.myMsg.openMessage("error", err);
        });
    },
    surePassword() {
      try {
        for (let obj of this.walletList) {
          if (this.fromAddress == obj.address) {
            this.privateKey = Utils.decryptContent(
              obj.privateKey,
              this.password
            );
            break;
          }
        }

        this.password = "";
        this.showPw = false;
        this.showStop = true;
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].state != 2 && this.tableData[i].state != 3) {
            this.transIndex = i;
            this.posCurrentRow(this);
            break;
          }
        }
        if (this.transIndex == -1) {
          this.$refs.myMsg.openMessage("info", this.$t("bsNoTransferableData"));
          this.showStop = false;
        } else {
          if (this.transCoin == "FIL") {
            this.tronWeb = null;
          } else if (this.transCoin == "TRON") {
            this.tronWeb = new TronWeb(
              fullNode,
              solidityNode,
              null,
              this.privateKey
            );
          }
          this.makeTransaction();
        }
      } catch (err) {
        this.password = "";
        this.showPw = false;
        this.showStop = false;
        window.logger.verbose("Batch Transfer: sure password - ");
        window.logger.error(err);
        if (err.toString().indexOf("wrong password") != -1) {
          this.$refs.myMsg.openMessage("error", this.$t("comPasswordError"));
        } else {
          this.$refs.myMsg.openMessage("error", err);
        }
      }
    },
    startBatchTrans() {
      this.transIndex = -1;
      this.transExportTxPath = "";

      if (this.fromAddress == "") {
        this.$refs.myMsg.openMessage("info", this.$t("btFromAddrInfo"));
        return;
      }

      if (this.tableData.length == 0) {
        this.$refs.myMsg.openMessage("info", this.$t("bsToAddressInfo"));
        return;
      }

      if (this.transCoin == "FIL") {
        getFilAsset(this.fromAddress)
          .then((res) => {
            if (res == 0) {
              this.$refs.myMsg.openMessage("info", this.$t("bsBalanceZero"));
            } else {
              this.showPw = true;
            }
          })
          .catch((err) => {
            window.logger.verbose("Batch Transfer: getFilAsset - ");
            window.logger.error(err);
            if (err == 0) {
              this.$refs.myMsg.openMessage("info", this.$t("bsBalanceZero"));
            } else if (err.toString().indexOf("Failed to fetch") != -1) {
              this.$refs.myMsg.openMessage("info", this.$t("bsFailedToFetch"));
            } else {
              this.$refs.myMsg.openMessage("error", err);
            }
          });
      } else if (this.transCoin == "TRON") {
        this.showPw = true;
      }
    },
    stopTransfer() {
      this.showStop = false;
      this.tronWeb = null;
      this.privateKey = "";
    },
    async makeTransaction() {
      let that = this;
      setTimeout(
        async () => {
          if (!that.showStop) return;
          if (that.transIndex >= that.tableData.length) {
            that.stopTransfer();
            return;
          }

          let transRow = that.tableData[that.transIndex];
          if (
            transRow.state == 0 ||
            (transRow.state == 1 && transRow.txid == "") ||
            transRow.state == 4
          ) {
            if (this.transCoin == "FIL") {
              await that.sendFil(that, transRow);
            } else if (this.transCoin == "TRON") {
              await that.sendTrc20(that, transRow);
            }
          } else if (transRow.state == 1 && transRow.txid != "") {
            if (this.transCoin == "FIL") {
              await that.getFilTxState(that, transRow);
            } else if (this.transCoin == "TRON") {
              await that.getTrc20TxState(that, transRow);
            }
          } else {
            that.transIndex++;
            this.posCurrentRow(this);
            that.makeTransaction();
          }
        },
        5000,
        that
      );
    },
    async sendFil(that, transRow) {
      try {
        if (!that.showStop) return;

        transRow.state = 1;
        let msg = {
          From: that.fromAddress,
          To: transRow.toAddress,
          Value: new BigNumber(transRow.toNum)
            .multipliedBy(that.accuracyFil)
            .toFixed(),
        };

        if (msg.Value.indexOf(".") != -1) {
          throw new Error(that.$t("bsTransNumError"));
        }

        let gasRes = await fil_gasEstimateMessageGas(msg);

        if (gasRes.data.result) {
          msg["GasLimit"] = gasRes.data.result.GasLimit;
          msg["GasFeeCap"] = gasRes.data.result.GasFeeCap;
          msg["GasPremium"] = gasRes.data.result.GasPremium;

          await that.createMsg(that, transRow, msg);
        } else if (
          gasRes.data.error.message.toString().indexOf("RetCode=6") != -1
        ) {
          transRow.state = 4;
          that.stopTransfer();
          that.$refs.myMsg.openMessage("error", that.$t("bsInsufficientFunds"));
        } else {
          that.makeTransaction();
        }
      } catch (err) {
        transRow.state = 3;
        that.stopTransfer();
        window.logger.verbose("Batch Transfer: sendFil - ");
        window.logger.error(err);
        that.$refs.myMsg.openMessage("error", err);
      }
    },
    async createMsg(that, transRow, msg) {
      try {
        if (!that.showStop) return;

        let message = await walletProvider.createMessage(msg);
        if (!message.GasFeeCap) {
          that.makeTransaction();
          return;
        }

        let newMsg = {
          to: message.To,
          from: message.From,
          nonce: message.Nonce,
          value: message.Value.toString(),
          gaslimit: Number(message.GasLimit.toString()),
          gasfeecap: message.GasFeeCap.toString(),
          gaspremium: message.GasPremium.toString(),
          method: message.Method,
          params: message.Params,
        };

        let signedTx = wasm.transactionSignLotus(newMsg, that.privateKey);

        let sMsg = await walletProvider.sendSignedMessage(JSON.parse(signedTx));
        if (!sMsg["/"]) {
          transRow.state = 3;
          that.stopTransfer();
          window.logger.verbose("Batch Transfer: sendSignedMessage - ");
          window.logger.error(sMsg);
          that.$refs.myMsg.openMessage("error", that.$t("bsSendSignMsgError"));
          return;
        }

        transRow.txid = sMsg["/"];
        that.transAppendFile(transRow);
        that.makeTransaction();
      } catch (err) {
        transRow.state = 3;
        that.stopTransfer();
        window.logger.verbose("Batch Transfer: createMsg - ");
        window.logger.error(err);
        if (err.toString().indexOf("not enough funds") != -1) {
          transRow.state = 4;
          that.$refs.myMsg.openMessage("error", that.$t("bsInsufficientFunds"));
        } else {
          that.$refs.myMsg.openMessage("error", err);
        }
      }
    },
    async getFilTxState(that, transRow) {
      try {
        if (!that.showStop) return;

        let blockHeight = "";
        await fil_stateSearchMsg(transRow.txid).then((resHeight) => {
          if (resHeight.data.error) {
            throw new Error(resHeight.data.error.message);
          }
          if (resHeight.data.result && resHeight.data.result.Height) {
            blockHeight = resHeight.data.result.Height - 1;
          } else {
            that.makeTransaction();
          }
        });

        if (blockHeight == "") return;
        let cids = "";
        await fil_chainGetTipSetByHeight(blockHeight).then((resCids) => {
          if (resCids.data.error) {
            throw new Error(resCids.data.error.message);
          }
          if (resCids.data.result && resCids.data.result.Cids) {
            cids = resCids.data.result.Cids;
          } else {
            that.makeTransaction();
          }
        });

        if (cids == "") return;
        await fil_stateReplay(cids, transRow.txid).then((resReplay) => {
          if (resReplay.data.error) {
            throw new Error(resReplay.data.error.message);
          }
          if (resReplay.data.result && resReplay.data.result.MsgRct) {
            if (
              resReplay.data.result.MsgRct.ExitCode == 0 &&
              resReplay.data.result.MsgRct.GasUsed > 0
            ) {
              transRow.state = 2;
            } else {
              transRow.state = 4;
            }
            that.transIndex++;
            this.posCurrentRow(this);
            that.makeTransaction();
          } else {
            that.makeTransaction();
          }
        });
      } catch (err) {
        transRow.state = 3;
        that.stopTransfer();
        window.logger.verbose("Batch Transfer: getFilTxState - ");
        window.logger.error(err);
        that.$refs.myMsg.openMessage("error", err);
      }
    },
    transAppendFile(transRow) {
      if (this.transExportTxPath == "") {
        this.transExportTxPath =
          this.filePath.slice(0, this.filePath.lastIndexOf(".txt")) +
          "-trans-" +
          new Date().getTime() +
          ".txt";
      }

      let exportStr = "";
      exportStr +=
        transRow.toAddress +
        "," +
        transRow.toNum +
        "," +
        transRow.txid +
        "\r\n";

      fs.open(this.transExportTxPath, "a", (err, fd) => {
        if (err) {
          window.logger.verbose("Batch Transfer: fs open error - ");
          window.logger.error(err);
        } else {
          fs.appendFile(fd, exportStr, "utf8", (err) => {
            if (err) {
              window.logger.verbose("Batch Transfer: fs appendFile error - ");
              window.logger.error(err);
            } else {
              fs.close(fd, (err) => {
                if (err) {
                  window.logger.verbose("Batch Transfer: fs close error - ");
                  window.logger.error(err);
                }
              });
            }
          });
        }
      });
    },
    // stopTransfer() {
    //   clearInterval(this.batchTransTimer);
    //   clearInterval(this.checkTxStateTimer);
    //   this.showStop = false;
    //   this.isTrans = false;
    // },
    // //FIL转账
    // makeTransaction() {
    //   let that = this;
    //   that.batchTransTimer = setInterval(
    //     (function makeTrans() {
    //       if (!that.showStop) {
    //         that.stopTransfer();
    //       } else {
    //         while (!that.isTrans) {
    //           that.isTrans = true;
    //           that.transIndex++;
    //           if (that.transIndex >= that.tableData.length) {
    //             that.stopTransfer();
    //             break;
    //           } else {
    //             that.sendFil();
    //           }
    //         }
    //       }
    //       return makeTrans;
    //     })(),
    //     7000
    //   );
    // },
    // async sendFil() {
    //   let that = this;
    //   let obj = that.tableData[that.transIndex];
    //   if (obj.state == 0 || obj.state == 4) {
    //     obj.state = 1;
    //     let msg = {
    //       From: that.fromAddress,
    //       To: obj.toAddress,
    //       Value: new BigNumber(obj.toNum).multipliedBy(that.accuracyFil).toFixed()
    //     };

    //     fil_gasEstimateMessageGas(msg)
    //       .then((res) => {
    //         let result = res.data.result;
    //         if (result) {
    //           msg["GasLimit"] = result.GasLimit;
    //           msg["GasFeeCap"] = result.GasFeeCap;
    //           msg["GasPremium"] = result.GasPremium;

    //           walletProvider
    //             .createMessage(msg)
    //             .then((message) => {
    //               let newMsg = {
    //                 to: message.To,
    //                 from: message.From,
    //                 nonce: message.Nonce,
    //                 value: message.Value.toString(),
    //                 gaslimit: Number(message.GasLimit.toString()),
    //                 gasfeecap: message.GasFeeCap.toString(),
    //                 gaspremium: message.GasPremium.toString(),
    //                 method: message.Method,
    //                 params: message.Params,
    //               };

    //               let signedTx = wasm.transactionSignLotus(
    //                 newMsg,
    //                 that.privateKey
    //               );

    //               walletProvider
    //                 .sendSignedMessage(JSON.parse(signedTx))
    //                 .then((res) => {
    //                   if (res["/"]) {
    //                     let cid = res["/"];
    //                     that.tableData[that.transIndex].txid = cid;

    //                     that.transAppendFile();

    //                     that.checkTxStateTimer = setInterval(() => {
    //                       that.getFilTxState(that, cid);
    //                     }, 15000);
    //                   }
    //                 })
    //                 .catch((errSign) => {
    //                   that.tableData[that.transIndex].state = 3;
    //                   that.stopTransfer();
    //                   that.$refs.myMsg.openMessage(
    //                     "error",
    //                     that.$t("bsSendSignMsgError")
    //                   );
    //                   console.log("sendSignedMessage");
    //                   console.log(errSign);
    //                 });
    //             })
    //             .catch((errCreate) => {
    //               that.tableData[that.transIndex].state = 3;
    //               that.stopTransfer();
    //               that.$refs.myMsg.openMessage(
    //                 "error",
    //                 that.$t("bsCreateMsgError")
    //               );
    //               console.log("createMessage");
    //               console.log(errCreate);
    //             });
    //         } else {
    //           let error = res.data.error;
    //           if (error.message.toString().indexOf("RetCode=6") != -1) {
    //             that.tableData[that.transIndex].state = 0;
    //             that.stopTransfer();
    //             that.$refs.myMsg.openMessage(
    //               "error",
    //               that.$t("bsInsufficientFunds")
    //             );
    //           } else {
    //             that.tableData[that.transIndex].state = 0;
    //             that.transIndex--;
    //           }
    //         }
    //       })
    //       .catch((errGas) => {
    //         that.tableData[that.transIndex].state = 3;
    //         that.stopTransfer();
    //         that.$refs.myMsg.openMessage(
    //           "error",
    //           that.$t("bsGetGasError")
    //         );
    //         console.log("fil_gasEstimateMessageGas");
    //         console.log(errGas);
    //       });
    //   } else {
    //     that.isTrans = false;
    //   }
    // },
    // async getFilTxState(that, cid) {
    //   if (!that.showStop) {
    //     that.stopTransfer();
    //     return;
    //   }
    //   fil_stateSearchMsg(cid)
    //     .then((res) => {
    //       if (res.data.result != null) {
    //         let blockHeight = res.data.result.Height - 1;
    //         fil_chainGetTipSetByHeight(blockHeight)
    //           .then((res2) => {
    //             if (res2.data.result != null) {
    //               let cids = res2.data.result.Cids;
    //               fil_stateReplay(cids, cid)
    //                 .then((res3) => {
    //                   let msgRct = res3.data.result.MsgRct;
    //                   if (msgRct) {
    //                     if (msgRct.ExitCode == 0 && msgRct.GasUsed > 0) {
    //                       that.tableData[that.transIndex].state = 2;
    //                     } else {
    //                       that.tableData[that.transIndex].state = 4;
    //                     }
    //                     if (that.transIndex + 1 == that.tableData.length) {
    //                       that.stopTransfer();
    //                     } else {
    //                       that.isTrans = false;
    //                       clearInterval(that.checkTxStateTimer);
    //                     }
    //                   }
    //                 })
    //                 .catch((errReplay) => {
    //                   that.stopTransfer();
    //                   that.tableData[that.transIndex].state = 3;
    //                   that.$refs.myMsg.openMessage(
    //                     "error",
    //                     that.$t("bsGetTxStateError")
    //                   );
    //                   console.log("fil_stateReplay");
    //                   console.log(errReplay);
    //                 });
    //             }
    //           })
    //           .catch((errHeight) => {
    //             that.stopTransfer();
    //             that.tableData[that.transIndex].state = 3;
    //             that.$refs.myMsg.openMessage(
    //               "error",
    //               that.$t("bsGetBlockError")
    //             );
    //             console.log("fil_chainGetTipSetByHeight");
    //             console.log(errHeight);
    //           });
    //       }
    //     })
    //     .catch((errState) => {
    //       that.stopTransfer();
    //       that.tableData[that.transIndex].state = 3;
    //       that.$refs.myMsg.openMessage(
    //         "error",
    //         that.$t("bsGetTxMsgError")
    //       );
    //       console.log("fil_stateSearchMsg");
    //       console.log(errState);
    //     });
    // },
    // transAppendFile() {
    //   if (this.transExportTxPath == "") {
    //     this.transExportTxPath =
    //       this.filePath.slice(0, this.filePath.lastIndexOf(".txt")) +
    //       "-trans-" +
    //       new Date().getTime() +
    //       ".txt";
    //   }

    //   let exportStr = "";
    //   exportStr +=
    //     this.tableData[this.transIndex].toAddress +
    //     "," +
    //     this.tableData[this.transIndex].toNum +
    //     "," +
    //     this.tableData[this.transIndex].txid +
    //     "\r\n";

    //   fs.open(this.transExportTxPath, "a", (err, fd) => {
    //     if (err) {
    //       console.log("fs open error");
    //     } else {
    //       fs.appendFile(fd, exportStr, "utf8", (err) => {
    //         if (err) {
    //           console.log("fs appendFile error");
    //         } else {
    //           fs.close(fd, (err) => {
    //             if (err) {
    //               console.log("fs close error");
    //             }
    //           });
    //         }
    //       });
    //     }
    //   });
    // },
    async sendTrc20(that, transRow) {
      try {
        transRow.state = 1;

        let toNum = new BigNumber(transRow.toNum)
          .multipliedBy(that.accuracyTrc20Usdt)
          .toFixed();
        if (toNum.indexOf(".") != -1) {
          throw new Error(that.$t("bsTransNumError"));
        }

        let contract = await that.tronWeb.contract().at(that.trc20USDT);
        that.tronWeb.setAddress(that.fromAddress);
        await contract
          .transfer(transRow.toAddress, toNum)
          .send({
            feeLimit: that.tronLimitBig,
          })
          .then((res) => {
            transRow.txid = res;
            that.transAppendFile(transRow);
            that.makeTransaction();
          });
      } catch (err) {
        transRow.state = 3;
        that.stopTransfer();
        window.logger.verbose("Batch Transfer: sendTrc20 - ");
        window.logger.error(err);
        if (err.message.indexOf("account does not exist") != -1) {
          transRow.state = 4;
          that.$refs.myMsg.openMessage("info", that.$t("bsTronAccountError"));
        } else if (err.message == "AccountResourceInsufficient error") {
          transRow.state = 4;
          that.$refs.myMsg.openMessage("info", that.$t("bsInsufficientFunds"));
        } else {
          that.$refs.myMsg.openMessage("error", err);
        }
      }
    },
    async getTrc20TxState(that, transRow) {
      try {
        await that.$store.state.tronWeb.trx
          .getTransaction(transRow.txid)
          .then((res) => {
            if (res.ret) {
              let ret = res.ret[0].contractRet;
              if (ret == "SUCCESS") {
                transRow.state = 2;
              } else {
                throw new Error(res.ret[0].contractRet);
              }
              that.transIndex++;
              this.posCurrentRow(this);
              that.makeTransaction();
            } else {
              that.makeTransaction();
            }
          });
      } catch (err) {
        transRow.state = 3;
        that.stopTransfer();
        window.logger.verbose("Batch Transfer: getTrc20TxState - ");
        window.logger.error(err);
        if (err.toString().indexOf("OUT_OF_ENERGY") != -1) {
          transRow.state = 4;
          err = that.$t("bsTronOutOfEnergy");
        } else if (err.toString().indexOf("REVERT") != -1) {
          transRow.state = 4;
          err = that.$t("bsTronRevertRevert");
        }
        that.$refs.myMsg.openMessage("error", err);
      }
    },
    posCurrentRow(that) {
      //bodyWrapper是拆分组件后的table容器
      let bodyWrapper = that.$refs.tableList.bodyWrapper;
      if (that.transIndex < 4) return;

      // e为行号
      if (bodyWrapper.children[0].rows[that.transIndex - 4]) {
        bodyWrapper.scrollTop =
          bodyWrapper.children[0].rows[that.transIndex - 4].offsetTop;
      }
    },
    exportTransResult() {
      if (this.tableData.length == 0 || this.tableData[0].state == 0) {
        this.$refs.myMsg.openMessage(
          "info",
          this.$t("bsExportTransResultInfo")
        );
        return;
      }

      let exportStr = "";
      for (let i = 0; i < this.tableData.length; i++) {
        switch (this.tableData[i].state) {
          case 0:
            exportStr += this.$t("bsStateWaiting") + ",";
            break;
          case 1:
            exportStr += this.$t("bsStatePending") + ",";
            break;
          case 2:
            exportStr += this.$t("bsStateSucceed") + ",";
            break;
          case 3:
            exportStr += this.$t("bsStateWarn") + ",";
            break;
          case 4:
            exportStr += this.$t("bsStateFailed") + ",";
            break;
          default:
            this.$refs.myMsg.openMessage("error", this.$t("bsStateError"));
            return;
        }
        exportStr +=
          this.tableData[i].toAddress +
          "," +
          this.tableData[i].toNum +
          "," +
          this.tableData[i].txid +
          "\r\n";
      }

      this.downFile(exportStr);
    },
  },
  beforeDestroy() {
    if (
      this.tableData.length > 0 &&
      this.tableData[0].state != 0 &&
      this.filePath != ""
    ) {
      let exportStr = "";
      for (let i = 0; i < this.tableData.length; i++) {
        switch (this.tableData[i].state) {
          case 0:
            exportStr += this.$t("bsStateWaiting") + ",";
            break;
          case 1:
            exportStr += this.$t("bsStatePending") + ",";
            break;
          case 2:
            exportStr += this.$t("bsStateSucceed") + ",";
            break;
          case 3:
            exportStr += this.$t("bsStateWarn") + ",";
            break;
          case 4:
            exportStr += this.$t("bsStateFailed") + ",";
            break;
          default:
            this.$refs.myMsg.openMessage("error", this.$t("bsStateError"));
            return;
        }
        exportStr +=
          this.tableData[i].toAddress +
          "," +
          this.tableData[i].toNum +
          "," +
          this.tableData[i].txid +
          "\r\n";
      }

      let newPath = this.filePath.slice(0, this.filePath.lastIndexOf(".txt"));
      newPath = newPath + "-close-" + new Date().getTime() + ".txt";
      fs.writeFile(newPath, exportStr, (err) => {
        if (err) {
          window.logger.verbose("Batch Transfer: fs writeFile error - ");
          window.logger.error(err);
        } else {
          window.logger.info(
            "Batch Transfer: fs writeFile success - " + newPath
          );
        }
      });
    }
  },
};
</script>

<style lang="less">
.batch-trans {
  display: flex;
  flex-direction: column;

  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .mask-container {
      width: 350px;
      height: 400px;
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;
      background: #fff;
      border-radius: 10px;

      .top-gif {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        position: absolute;
        top: -50px;
        background: #fff;
      }

      img {
        position: absolute;
        left: 5px;
        width: 80px;
        height: 80px;
      }

      .content {
        height: 290px;
        padding-top: 40px;
        text-align: center;

        h2 {
          margin: 0;
          font-size: 24px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #425062;
          line-height: 33px;
        }

        p {
          margin: 0;
          padding: 5px 0 10px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #788697;
          line-height: 20px;
        }
      }

      .stop-btn {
        button {
          width: 300px;
          height: 48px;
          background: #ffa2a2;
          border-radius: 24px;
          font-size: 20px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
        }
      }
    }
  }

  .batch-top {
    height: 190px;
    padding: 40px 0 0 20px;
    margin-bottom: 20px;
    background: url("../assets/img/transferBanner.png");
    background-size: 100% 100%;
    border-radius: 16px;
    box-sizing: border-box;

    .container {
      width: 1050px;

      .top-label {
        height: 28px;
        margin-bottom: 15px;
        font-size: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 28px;
      }

      .label1 {
        display: inline-block;
        width: 260px;
        margin-right: 23px;
      }

      .label2 {
        display: inline-block;
        width: 600px;
        margin-right: 23px;
      }

      .content {
        display: flex;
        padding-bottom: 25px;
        position: relative;

        .select-before {
          position: absolute;
          width: 27px;
          height: 27px;
          z-index: 1;
          padding: 7px 5px 0 10px;
        }

        .el-select {
          height: 40px;
          border-radius: 20px;
          border: 1px solid #0676ed;

          input {
            border-radius: 20px;
            font-size: 18px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000;
            line-height: 25px;
            text-overflow: ellipsis;
          }

          input::-webkit-input-placeholder {
            font-size: 12px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #d8d8d8;
            line-height: 16px;
          }
        }

        .top-coin {
          width: 260px;
          margin-right: 23px;

          .el-select {
            width: 260px;
          }
        }

        .top-addr {
          width: 600px;
          margin-right: 23px;
        }

        .top-limit {
          width: 120px;
          height: 40px;
          background: #fdfefe;
          border-radius: 20px;
          border: 1px solid #0676ed;
          font-size: 18px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #000;
          line-height: 25px;

          input {
            border-radius: 20px 0 0 20px;
            padding: 0 0 0 10px;
          }

          div {
            padding: 0 10px;
            border-radius: 0 20px 20px 0;
            background: #f5f7fa;
          }
        }
      }

      .option-file {
        display: flex;
        justify-content: flex-end;

        .option-btn {
          display: flex;
          align-items: center;
          width: 200px;
          height: 30px;
          font-size: 16px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #0676ed;
          line-height: 22px;
          cursor: pointer;

          img {
            width: 22px;
            height: 22px;
            padding-right: 4px;
          }
        }
      }
    }
  }

  .batch-table {
    img {
      width: 20px;
      height: 20px;
      padding-left: 15px;
    }
  }

  .bottom-btn {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      width: 180px;
      height: 36px;
      background: #0676ed;
      box-shadow: 3px 3px 10px -1px rgba(11, 27, 102, 0.3);
      border-radius: 20px;
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
    }

    .btn2 {
      background: #fdfefe;
      border: 1px solid #dae1ed;
      color: #8f9bb3;
    }
  }
}

.el-select-dropdown__item {
  display: flex;
  align-items: center;

  img {
    width: 27px;
    height: 27px;
    padding-right: 10px;
  }
}

.top-coin {
  .el-input__inner {
    padding: 0 30px 0 40px;
  }
}
</style>
