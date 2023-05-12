<template>
  <div class="home container-full">
    <div v-show="loading" class="load-overlay">
      <img src="../assets/img/loading.gif" alt="" />
    </div>
    <el-header class="title">
      <span>{{ $t("home") }}</span>
    </el-header>
    <my-chain :currentChain="currentChain" @changeChain="changeChain($event)">
    </my-chain>
    <el-main class="main-container" :style="widthString">
      <el-table
        :data="tableData"
        :show-overflow-tooltip="true"
        :header-row-class-name="headerRowClass"
        :header-cell-class-name="headerCellClass"
        :row-class-name="rowClass"
        :cell-class-name="cellClass"
        :row-style="selectRowStyle"
        @row-click="rowClick"
        height="100%"
      >
        <el-table-column prop="name" :label="$t('comAddrLabel')">
        </el-table-column>
        <el-table-column prop="address" :label="$t('comAddress')" width="410">
        </el-table-column>
        <el-table-column v-if="currentChain == 'TRON'" label="TRX">
          <template slot-scope="scope">
            {{
              scope.row.asset.toFixed(4) == 0 ? 0 : scope.row.asset.toFixed(4)
            }}
          </template>
        </el-table-column>
        <el-table-column v-else :label="currentChain">
          <template slot-scope="scope">
            {{
              scope.row.asset.toFixed(4) == 0 ? 0 : scope.row.asset.toFixed(4)
            }}
          </template>
        </el-table-column>
      </el-table>
      <div class="rightPhone" ref="rightPhone" v-show="showRight">
        <div class="rightPhone1" v-show="showRight">
          <div
            v-show="hide"
            class="verticalBarClose"
            ref="verticalBarClose"
            @click="openOrclose('close')"
          ></div>
          <div
            v-show="!hide"
            @click="openOrclose('open')"
            ref="verticalBar"
            class="verticalBar"
          >
            <img src="../assets/img/hideImg.png" alt />
            <span v-bind:class="currentLang == 'en-us' ? 'encss-asset' : ''">
              {{ $t("homeAsset") }}
            </span>
          </div>
        </div>
        <div class="rightMain">
          <p>{{ $t("homeAsset") }}</p>
          <div class="box" v-for="(v, i) of this.assetLists" :key="i">
            <div class="leftDiv">
              <img
                v-if="currentChain == 'BHP'"
                src="../assets/img/logoBhp.png"
                alt=""
              />
              <img
                v-else-if="currentChain == 'TRON'"
                src="../assets/img/logoTron.png"
                alt=""
              />
              {{ v.name }}
            </div>
            <div class="asset">
              {{ v.allAsset.toFixed(4) == 0 ? 0 : v.allAsset.toFixed(4) }}
            </div>
          </div>
        </div>
      </div>
    </el-main>
    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
import {
  allAssets2,
  allAssetsFIL,
  allAssetsTron,
  getTronTokenBalance,
} from "../assets/js/myWallet";
const Web3 = require("web3");
import global from "../assets/js/globalIP";
import myChain from "../components/myChain";
import bhpConst from "../assets/const/bhpConst";

export default {
  components: { myChain },
  data() {
    return {
      currentLang: localStorage.getItem("language"),
      currentChain: "BHP",
      showRight: true,
      loading: false,
      hide: false,
      drawer: false,
      widthString: "width: calc(100% - 76px)",
      tableData: [],
      assetLists: [],
      selectIndex: -1,
    };
  },
  mounted() {
    if (!navigator.onLine) {
      this.$refs.myMsg.openMessage("info", this.$t("comNetError"));
    }
  },
  created() {
    if (JSON.parse(localStorage.getItem("assetLists"))) {
      for (let asset of JSON.parse(localStorage.getItem("assetLists"))) {
        if (this.currentChain == asset.chainName) {
          //BHP
          this.assetLists = asset.assets;
        }
      }
    } else {
      localStorage.setItem("assetLists", JSON.stringify(this.assetLists));
    }

    for (let obj of JSON.parse(sessionStorage.getItem("bhpWalletList"))) {
      if (this.currentChain == obj.chainName) {
        //BHP
        this.loading = true;
        this.tableData = obj.accounts;
        allAssets2(this)
          .then(() => {
            this.loading = false;
          })
          .catch((err) => {
            this.loading = false;
            this.$refs.myMsg.openMessage("info", err);
          });
      }
    }
  },
  methods: {
    changeChain(val) {
      if (this.loading) return;
      if (this.currentChain == val) return;

      this.tableData = [];
      this.assetLists = [];
      this.selectIndex = -1;

      switch (val) {
        case "FIL":
          this.currentChain = "FIL";
          this.showRight = false;
          this.widthString = "width: calc(100% - 30px)";
          break;
        case "TRON":
          this.currentChain = "TRON";
          this.showRight = true;
          this.openOrclose("close");
          this.widthString = "width: calc(100% - 76px)";
          break;
        default:
          this.currentChain = "BHP";
          this.showRight = true;
          this.openOrclose("close");
          this.widthString = "width: calc(100% - 76px)";
          break;
      }

      this.loading = true;
      if (JSON.parse(localStorage.getItem("assetLists"))) {
        for (let asset of JSON.parse(localStorage.getItem("assetLists"))) {
          if (this.currentChain == asset.chainName) {
            this.assetLists = asset.assets;
          }
        }
      }

      for (let obj of JSON.parse(sessionStorage.getItem("bhpWalletList"))) {
        if (this.currentChain == obj.chainName) {
          switch (obj.chainName) {
            case "FIL":
              this.tableData = obj.accounts;
              allAssetsFIL(this)
                .then(() => {
                  this.loading = false;
                })
                .catch((errFil) => {
                  this.loading = false;
                  this.$refs.myMsg.openMessage("info", errFil);
                });
              break;
            case "TRON":
              this.tableData = obj.accounts;
              allAssetsTron(this)
                .then(() => {
                  this.loading = false;
                })
                .catch((errTron) => {
                  this.loading = false;
                  this.$refs.myMsg.openMessage("info", errTron);
                });
              break;
            default:
              //BHP
              this.tableData = obj.accounts;
              allAssets2(this)
                .then(() => {
                  this.loading = false;
                })
                .catch((err) => {
                  this.loading = false;
                  this.$refs.myMsg.openMessage("info", err);
                });
              break;
          }
        }
      }
    },
    headerRowClass() {
      return "headerRowCss";
    },
    headerCellClass(row) {
      return "headerCellCss";
    },
    rowClass(row) {
      row.row.index = row.rowIndex;
      if (row.rowIndex % 2 == 0) {
        return "rowCss rowEvenCss";
      } else {
        return "rowCss rowOddCss";
      }
    },
    selectRowStyle(row) {
      if (this.selectIndex === row.rowIndex) {
        return {
          color: "#fff",
          background: "#0676ed !important",
        };
      }
    },
    cellClass(row) {
      return "cellCss";
    },
    async rowClick(row) {
      this.selectIndex = row.index;
      try {
        this.loading = true;
        // 通过地址查询ERC20资产
        if (this.currentChain == "BHP") {
          this.$refs.rightPhone.style.right = "0";
          this.widthString = "width: calc(100% - 290px)";
          this.hide = true;
          for (let i in this.assetLists) {
            await this.getETHCoin(
              this.assetLists[i],
              this.assetLists,
              row.address
            );
          }
        } else if (this.currentChain == "TRON") {
          this.$refs.rightPhone.style.right = "0";
          this.widthString = "width: calc(100% - 290px)";
          this.hide = true;
          for (let i in this.assetLists) {
            await this.getTrc20(
              this.assetLists[i],
              this.assetLists,
              row.address
            );
          }
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
        console.log(err);
      }
    },
    openOrclose(val) {
      if (this.currentChain == "BHP" || this.currentChain == "TRON") {
        if (val == "open") {
          this.$refs.rightPhone.style.right = "0";
          this.hide = true;
          this.widthString = "width: calc(100% - 290px)";
        } else {
          this.$refs.rightPhone.style.right = "-270px";
          this.hide = false;
          this.widthString = "width: calc(100% - 76px)";
        }
      }
    },
    //获取以太坊或BHP代币
    async getETHCoin(oneOfETHlist, selectList, address) {
      //selectList--bhp/eth代币列表
      let web3;
      // if (this.walletType == "BHP2") {
      if (typeof web3 !== "undefined") {
        web3 = await new Web3(web3.currentProvider);
      } else {
        web3 = await new Web3(new Web3.providers.HttpProvider(global.getIp())); //BHP2.0的节点
      }
      // } else {
      //   if (typeof web3 !== "undefined") {
      //     web3 = await new Web3(web3.currentProvider);
      //   } else {
      //     web3 = await new Web3(new Web3.providers.HttpProvider(IP + "/eth")); //以太坊的节点
      //   }
      // }

      // 定义合约
      let myContract = new web3.eth.Contract(
        bhpConst.bhpContractAbi,
        oneOfETHlist.address
      );
      await this.getOtherERC(myContract, oneOfETHlist, selectList, address);
    },
    //查询ETH或BHP代币名称,代币总余额，代币币价，精度
    async getOtherERC(currentContract, oneOfETHlist, selectList, address) {
      let that = this;
      for (let i in selectList) {
        if (selectList[i].address == oneOfETHlist.address) {
          selectList[i].allAsset = 0;
          await currentContract.methods
            .balanceOf(address) //用钱包地址
            .call(
              {
                from: address,
              },
              (error, result) => {
                if (!error) {
                  selectList[i].allAsset = parseFloat(
                    result / Math.pow(10, oneOfETHlist.decimals)
                  );
                } else {
                  selectList[i].allAsset = 0;
                }
              }
            );
        }
      }
    },
    async getTrc20(oneTrc20, trc20List, address) {
      try {
        for (let i in trc20List) {
          if (trc20List[i].address == oneTrc20.address) {
            trc20List[i].allAsset = 0;
            await getTronTokenBalance(this, oneTrc20, address);
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style lang="less">
@import url("../assets/css/comTable");

.home {
  display: flex;
  flex-direction: column;

  .main-container {
    flex-basis: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(46, 63, 114, 0.13) 0 0 10px;
    margin-left: 10px;
    border-radius: 13px 13px 0px 0px;
    transition: all 0.4s linear;

    .el-table {
      tbody {
        tr:hover {
          td {
            color: #fff;
            background: #0676ed !important;
          }
        }
      }
    }

    .rightPhone {
      position: fixed;
      transition: all 0.4s linear;
      top: 0;
      right: -270px;
      width: 270px;
      height: 100%;
      background: rgba(255, 255, 255, 0.59);
      box-shadow: 0px 2px 12px 0px rgba(46, 63, 114, 0.13);
      z-index: 999;

      .rightMain {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-top: 40px;

        .box {
          width: 210px;
          height: 50px;
          background: #fff;
          margin-bottom: 15px;
          box-shadow: 0px 2px 4px 0px rgba(170, 217, 255, 0.51);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          .leftDiv {
            display: flex;
            justify-content: center;
            align-items: center;
            img {
              width: 28px;
              height: 28px;
              margin-right: 6px;
            }
          }
          .asset {
            color: #ccc;
          }
        }
      }

      .rightPhone1 {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        position: relative;
        // height: 100%;
        .verticalBar {
          position: absolute;
          left: -70px;
          width: 60px;
          height: 100%;
          background: #ffffff;
          box-shadow: 0px 2px 12px 0px rgba(46, 63, 114, 0.13);
          top: 0;
          padding: 0 16px;
          text-align: center;
          box-sizing: border-box;
          white-space: break-all;
          font-size: 18px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: rgba(139, 189, 249, 0.58);
          line-height: 33px;

          img {
            width: 31px;
            height: 31px;
            padding-top: 300px;
            padding-bottom: 9px;
          }

          span {
            display: block;
          }
        }

        .verticalBarClose {
          position: absolute;
          left: 10px;
          top: 10px;
          width: 31px;
          height: 31px;
          background: url("../assets/img/hideImg.png") no-repeat;
          // background-size: cover;
          transform: rotate(180deg);
        }
      }
    }
  }
}

.encss-asset {
  transform: rotate(90deg);
  -ms-transform: rotate(90deg); /* IE 9 */
  -webkit-transform: rotate(90deg); /* Safari and Chrome */
}
</style>
