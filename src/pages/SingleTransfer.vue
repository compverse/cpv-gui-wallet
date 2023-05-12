<template>
  <div class="signal-trans-main">
    <div v-show="loading" class="load-overlay">
      <img src="../assets/img/loading.gif" alt="" />
    </div>
    <div class="content">
      <div class="transfer-container">
        <el-form :label-width="labelWidth">
          <el-form-item :label="$t('transChainName')">
            <el-select class="form-address" v-model="chainName"></el-select>
          </el-form-item>
          <el-form-item :label="$t('comCoinType')">
            <el-select
              class="form-address"
              @change="changeCoinType()"
              v-model="currentAsset"
            >
              <el-option
                v-for="(item, i) of selectETHlist"
                :key="i"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('transFromAddr')">
            <el-select
              v-model="localAddress"
              :placeholder="$t('transSelect')"
              @change="checkFromAddr()"
              class="form-address"
            >
              <el-option
                v-for="(item, i) of walletList"
                :key="i"
                :label="'(' + item.name + ') ' + item.address"
                :value="item.address"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('transToAddr')">
            <el-select
              v-model="inputAddress"
              filterable
              allow-create
              :placeholder="$t('transSelect')"
              @change="checkToAddr()"
              class="form-address"
            >
              <el-option
                v-for="(item, i) of addressList"
                :key="i"
                :label="'(' + item.name + ') ' + item.address"
                :value="item.address"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('transNum')"
            class="form-num"
            style="margin-bottom: 0"
          >
            <el-input v-model="inputAmount" @blur="checkAmount()">
              <template slot="append">{{ currentAsset }}</template>
            </el-input>
            <span style="color: #0676ed"
              >{{ $t("transBalance") }} {{ amount }} {{ currentAsset }}</span
            >
            <span v-show="prompt2" style="color: red">{{
              $t("transNumMsg")
            }}</span>
            <span v-show="prompt3" style="color: red"
              >{{ currentAsset }}{{ $t("transBalanceLow") }}</span
            >
          </el-form-item>
          <el-form-item :label="$t('transGas')" class="form-gas">
            <el-input v-model="gas" disabled>
              <template slot="append">BHP</template>
            </el-input>
            <span
              >Gas Limit&nbsp; {{ gasLimit }}&nbsp; * Gas Price ( GWEI ) <input
                ref="priceInput"
                @input="inputPrice()"
                class="priceInput"
                :disabled="disabled"
                type="text"
                v-model="gasPrice" /></span
            ><span
              style="color: #0676ed; cursor: pointer"
              @click="toCostom()"
              >{{ $t("transCustom") }}</span
            >
          </el-form-item>
        </el-form>
        <button @click="clickTransfer()">{{ $t("comTransfer") }}</button>
        <div>
          <p class="toRecord" @click="txRecord()" style="cursor: pointer">
            {{ $t("transTx") }}
          </p>
        </div>
      </div>
    </div>

    <el-dialog
      :title="$t('comPasswordP')"
      :visible.sync="show1"
      :close-on-click-modal="false"
    >
      <el-input v-model="password" type="password"></el-input>
      <span slot="footer">
        <el-button class="btn-cancel" @click="transferCancel()">
          {{ $t("comCancel") }}</el-button
        >
        <el-button @click="surePWD()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
import { assetes } from "../assets/js/myWallet";
import Utils from "../assets/js/utils.js";
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
const ethers = require("ethers");
import global from "../assets/js/globalIP";
import bhpConst from "../assets/const/bhpConst";

export default {
  data() {
    return {
      labelWidth: "155px",
      chainName: "BHP",
      totalAsset: 0, //基础币数量
      coinTotalAsset: 0, //代币总资产/rmb
      selectETHlist: [],
      currentAsset: "BHP",
      msg1: this.$t("transInitiated"),
      msg2: this.$t("comPasswordError"),
      msg3: this.$t("transAddrInvalid"),
      msg4: this.$t("transTxError"),
      password: "",
      amount: 0, //余额
      gas: "",
      gasLimit: "",
      gasPrice: 1,
      disabled: true,
      localAddress: "",
      addressList: [], //所有地址
      inputAddress: "",
      inputAmount: "",
      privateKey: "",
      loading: false,
      prompt1: false,
      prompt2: false,
      prompt3: false,
      show1: false,
      walletList: [],
      currentChain: "BHP",
    };
  },
  mounted() {
    if (!navigator.onLine) {
      this.$refs.myMsg.openMessage("info", this.$t("comNetError"));
    }

    if (localStorage.getItem("language") == "en-us") {
      this.labelWidth = "155px";
    } else {
      this.labelWidth = "90px";
    }
  },
  created() {
    let arr = JSON.parse(sessionStorage.getItem("bhpWalletList"));
    for (let i in arr) {
      if (this.chainName == arr[i].chainName) {
        this.walletList = arr[i].accounts;
        break;
      }
    }

    if (JSON.parse(localStorage.getItem("assetLists"))) {
      for (let obj of JSON.parse(localStorage.getItem("assetLists"))) {
        if (this.chainName == obj.chainName) {
          this.selectETHlist = obj.assets;
        }
      }
    }

    let obj = { name: "BHP" };
    this.selectETHlist.unshift(obj);

    if (this.currentAsset == "BHP") {
      this.gasLimit = 21000;
    } else {
      this.gasLimit = 600000;
    }
    this.gas = this.gasLimit / 1000000000;

    let localAddr = localStorage.getItem("addressList") || '""';
    for (let obj of JSON.parse(localAddr)) {
      if (this.chainName == obj.chainName) {
        this.addressList = obj.addresses;
      }
    }
  },
  methods: {
    changeChain(val) {
      if (this.currentChain == val) return;

      switch (val) {
        case "FIL":
          this.currentChain = "FIL";
          break;
        default:
          this.currentChain = "BHP";
          break;
      }
    },
    toCostom() {
      this.disabled = false;
      this.$refs.priceInput.style.border = "1px solid #111";
    },
    inputPrice() {
      if (!!!parseInt(this.gasPrice)) {
        this.gasPrice = 1;
      } else {
        this.gasPrice = parseInt(this.gasPrice);
      }
      this.gas = (this.gasPrice * this.gasLimit) / 1e9;
    },
    txRecord() {
      window.open(
        global.getExplorer() +
          "/address/" +
          this.localAddress +
          "/transactions",
        "_blank"
      );
    },
    //获取bhp代币
    async getETHCoin(oneOfETHlist) {
      let web3;
      if (typeof web3 !== "undefined") {
        web3 = await new Web3(web3.currentProvider);
      } else {
        web3 = await new Web3(new Web3.providers.HttpProvider(global.getIp()));
      }
      // 定义合约
      let myContract = new web3.eth.Contract(
        bhpConst.bhpContractAbi,
        oneOfETHlist.address
      );
      await this.getOtherERC(myContract, oneOfETHlist);
    },
    //查询代币名称,代币总余额，代币币价，精度
    async getOtherERC(currentContract, oneOfETHlist) {
      this.coinTotalAsset = 0;
      for (let i in this.selectETHlist) {
        if (this.selectETHlist[i].address == oneOfETHlist.address) {
          await currentContract.methods["decimals"]().call(
            { from: oneOfETHlist.address },
            (error, decimals) => {
              if (!error) {
                oneOfETHlist.decimals = decimals;
              }
            }
          );
          this.selectETHlist[i].ETHAsstesSum = 0; // ETHAsstesSum单个地址的合约资产
          let that = this;
          await currentContract.methods
            .balanceOf(that.localAddress)
            .call({ from: that.localAddress }, (error, result) => {
              if (!error) {
                that.selectETHlist[i].ETHAsstesSum = parseFloat(
                  result / Math.pow(10, that.selectETHlist[i].decimals)
                );
              } else {
                that.selectETHlist[i].ETHAsstesSum = 0;
              }
            });
        }
      }
      localStorage.setItem("assetLists", JSON.stringify(this.selectETHlist));
    },
    changeCoinType() {
      if (this.localAddress) {
        this.coinBalance();
      }
      if (this.currentAsset == "BHP") {
        this.gasLimit = 21000;
      } else {
        this.gasLimit = 600000;
      }
      this.gas = this.gasLimit / 1000000000;
    },

    //查询bhp以及代币单个地址余额

    async coinBalance() {
      if (this.currentAsset == "BHP") {
        assetes(this, this.localAddress);
        this.gasLimit = 21000;
      } else {
        this.gasLimit = 600000;
        let web3;
        if (typeof web3 !== "undefined") {
          web3 = await new Web3(web3.currentProvider);
        } else {
          web3 = await new Web3(
            new Web3.providers.HttpProvider(global.getIp())
          );
        }
        let that = this;
        for (let i in that.selectETHlist) {
          if (that.selectETHlist[i].name == that.currentAsset) {
            let myContract = new web3.eth.Contract(
              bhpConst.bhpContractAbi,
              that.selectETHlist[i].address
            );
            await myContract.methods
              .balanceOf(that.localAddress)
              .call({ from: that.localAddress }, function (error, result) {
                if (!error) {
                  that.amount = parseFloat(
                    result / Math.pow(10, that.selectETHlist[i].decimals)
                  ).toFixed(4);
                } else {
                }
              });
          }
        }
      }
    },
    clickTransfer() {
      if (
        this.localAddress &&
        this.inputAddress &&
        this.inputAmount &&
        !this.prompt1 &&
        !this.prompt2 &&
        !this.prompt3
      ) {
        this.show1 = true; //显示密码框输入密码
      } else if (!ethers.utils.isAddress(this.inputAddress)) {
        this.$refs.myMsg.openMessage("error", this.msg3);
      }
    },

    //2.0转账
    async MakeTransaction2() {
      var that = this;
      let flog = true;
      try {
        var privateKey = Utils.decryptContent(that.privateKey, that.password);
      } catch (err) {
        that.$refs.myMsg.openMessage("error", that.msg2);
        that.password = "";
        flog = false;
      }
      if (flog) {
        that.loading = true;

        if (that.currentAsset == "BHP") {
          let wallet = new ethers.Wallet(privateKey);
          var provider = new ethers.providers.JsonRpcProvider(global.getIp());

          let num = parseFloat(that.inputAmount * 1000000000000000000);
          var activeWallet = wallet.connect(provider);
          activeWallet
            .sendTransaction({
              to: that.inputAddress,
              value: "0x" + num.toString(16),
              gasPrice: "0x" + (that.gasPrice * 1000000000).toString(16), //1Gwei
              gasLimit: that.gasLimit,
            })
            .then((res) => {
              that.loading = false;

              that.$refs.myMsg.openMessage("success", that.msg1);
              that.password = "";
              that.$router.push({
                path: "/transfered",
                query: {
                  comCoinType: "BHP",
                  currentAsset: that.currentAsset,
                  amount: that.inputAmount,
                  transfPayAddress: that.localAddress,
                  transfToAddr: that.inputAddress,
                  transfTxHash: res.hash,
                },
              });
            })
            .catch((err) => {
              window.logger.verbose("Single Transfer: MakeTransaction2 - ");
              window.logger.error(err);
              that.loading = false;
              that.$refs.myMsg.openMessage("error", that.msg4);
              that.password = "";
            });
        } else {
          for (let i in that.selectETHlist) {
            if (that.currentAsset == that.selectETHlist[i].name) {
              await that.transfer(
                that.localAddress,
                that.inputAddress,
                that.inputAmount,
                privateKey.substr(2),
                that.selectETHlist[i].address, //合约地址
                that.selectETHlist[i].decimals //合约资产精度
              );
            }
          }
        }
        this.password = "";
      }
    },
    //ETH代币转账: 发送人地址 接受人地址 金额 当前账户私钥,代币合约地址
    async transfer(
      fromAddress,
      toAddress,
      balance,
      privateKey,
      contractAddress,
      decimals
    ) {
      let web3;
      if (typeof web3 !== "undefined") {
        web3 = await new Web3(web3.currentProvider);
      } else {
        web3 = await new Web3(new Web3.providers.HttpProvider(global.getIp()));
      }
      // 定义合约
      let that = this;
      let myContract = new web3.eth.Contract(
        bhpConst.bhpContractAbi,
        contractAddress
      );
      // ethGasLimit
      await web3.eth
        .getTransactionCount(fromAddress, web3.eth.defaultBlock.pending)
        .then(function (nonce) {
          const Ether = Math.pow(10, parseInt(decimals));
          //代币转账
          // data的组成，由：0x + 要调用的合约方法的function signature + 要传递的方法参数，每个参数都为64位(对transfer来说，第一个是接收人的地址去掉0x，第二个是代币数量的16进制表示，去掉前面0x，然后补齐为64位)
          let data = myContract.methods
            .transfer(toAddress, parseFloat(balance) * Ether)
            .encodeABI();
          let rawTx = {
            nonce: web3.utils.toHex(nonce++),
            gasLimit: web3.utils.toHex(that.gasLimit),
            gasPrice: web3.utils.toHex(1e9) * that.gasPrice,
            // 注意这里是代币合约地址
            to: contractAddress,
            from: fromAddress,
            value: "0x00",
            data: data,
          };
          let tx = new Tx(rawTx);
          let keyBuf = Buffer.from(privateKey, "hex");
          tx.sign(keyBuf);
          let serializedTx = tx.serialize().toString("hex");
          that.loading = true;

          web3.eth.sendSignedTransaction(
            "0x" + serializedTx.toString("hex"),
            (err, txHash) => {
              if (!err) {
                that.loading = false;
                that.$refs.myMsg.openMessage("success", that.msg1);

                that.$router.push({
                  path: "/transfered",
                  query: {
                    comCoinType: "BHP",
                    currentAsset: that.currentAsset,
                    amount: that.inputAmount,
                    transfPayAddress: that.localAddress,
                    transfToAddr: that.inputAddress,
                    transfTxHash: txHash,
                  },
                });
              } else {
                that.loading = false;
                that.$refs.myMsg.openMessage("error", err);
              }
              that.password = "";
            }
          );
        })
        .catch((err) => {
          window.logger.verbose("Single Transfer: transfer - ");
          window.logger.error(err);
          that.$refs.myMsg.openMessage("error", that.msg4);
          that.password = "";
          that.loading = false;
        });
    },
    // 补齐64位，不够前面用0补齐
    addPreZero(num) {
      let t = (num + "").length,
        s = "";
      for (let i = 0; i < 64 - t; i++) {
        s += "0";
      }
      return s + num;
    },
    transferCancel() {
      this.password = "";
      this.show1 = false;
    },
    async surePWD() {
      if (ethers.utils.isAddress(this.inputAddress)) {
        if (this.password == "") {
          this.$refs.myMsg.openMessage("info", this.$t("comPasswordP"));
          return;
        }
        try {
          this.loading = true;
          this.MakeTransaction2();
        } catch (err) {
          this.loading = false;

          this.$refs.myMsg.openMessage("error", this.msg2);

          this.password = "";
        }
      } else {
        this.$refs.myMsg.openMessage("error", this.msg3);
      }
      this.password = "";
      this.show1 = false;
    },
    checkToAddr() {
      if (!ethers.utils.isAddress(this.inputAddress)) {
        this.prompt1 = true;
        this.$refs.myMsg.openMessage("error", this.msg3);
      } else {
        this.prompt1 = false;
      }
    },
    checkFromAddr() {
      if (!ethers.utils.isAddress(this.localAddress)) {
        this.prompt1 = true;
        this.$refs.myMsg.openMessage("error", this.msg3);
      } else {
        this.prompt1 = false;
        for (let obj of this.walletList) {
          if (obj.address == this.localAddress) {
            this.privateKey = obj.privateKey;
          }
        }
      }
      //查余额
      this.coinBalance();
    },
    checkAmount() {
      this.show = false;
      this.inputAmount = this.inputAmount.match(/^\d*(\.?\d{0,4})/g)[0] || ""; //只能是最多四位小数的整数或小数
      var regstr = /^\d+(\.\d{0,4})?$/;
      if (parseFloat(this.amount) > parseFloat(this.inputAmount)) {
        this.prompt3 = false;
      } else {
        this.prompt3 = true; //余额不足
      }
      if (!regstr.test(this.inputAmount)) {
        this.prompt2 = true; //小数或整数
        this.prompt3 = false;
      } else {
        this.prompt2 = false;
      }
      if (this.inputAmount == 0) {
        this.inputAmount = "";
      }
    },
  },
};
</script>

<style lang="less">
.signal-trans-main {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .content {
    display: flex;
    text-align: center;
    margin: 0 auto;

    p {
      font-size: 18px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #292929;
      line-height: 25px;
    }

    .transfer-container {
      padding: 40px 38px 25px;
      width: 600px;
      border-radius: 7px;
      background: #fff;
      .form-address {
        width: 100%;
      }

      .form-gas,
      .form-num {
        text-align: left;
        color: #606266;
        span {
          padding-left: 15px;
          padding-right: 15px;
          font-size: 12px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          // color: #d8d8d8;
          line-height: 16px;
          white-space: pre;
        }
      }

      button {
        width: 180px;
        height: 36px;
        background: #0676ed;
        box-shadow: 3px 3px 10px -1px rgba(11, 27, 102, 0.3);
        border-radius: 20px;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
      .toRecord {
        display: inline-block;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #0676ed;
        line-height: 17px;
      }
      .priceInput {
        width: 40px;
        border: none;
        // text-indent: 10px;
      }
    }
  }
}

.el-form-item {
  margin-bottom: 40px;
}
.el-form-item__label {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #747474;
  padding-right: 20px;
  text-align-last: justify;
}

.el-input__inner {
  height: 40px;
  width: 100% !important;
}
.el-input {
  width: 100%;
}

.el-input-group__append {
  background: #fff;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #31394d;
}

.el-input-group--append .el-input__inner,
.el-input-group__prepend {
  border-right: none;
}
</style>
