<template>
  <div class="assetsManage container-full">
    <div v-show="loading" class="load-overlay">
      <img src="../assets/img/loading.gif" alt="" />
    </div>
    <div v-show="loading" class="load-overlay">
      <img src="../assets/img/loading.gif" alt="" />
    </div>
    <el-header class="title">
      <span>{{ $t("assetManagement") }}</span>
    </el-header>
    <my-chain
      :currentChain="currentChain"
      :showFil="false"
      @changeChain="changeChain($event)"
    >
    </my-chain>
    <el-main>
      <div class="asset-top">
        <p>{{ $t("asmAddAsset") }}</p>
        <div>
          <input
            type="text"
            v-model="contractAbiAddress"
            :placeholder="$t('asmContractAddrP')"
          />
          <button @click="addContract()">{{ $t("comAdd") }}</button>
        </div>
      </div>
      <div class="asset-list">
        <p>{{ $t("asmAssetList") }}</p>
        <div class="list-container">
          <div class="list-header">
            <span>{{ $t("comNum") }}</span>
            <span>{{ $t("comCoinType") }}</span>
            <span>{{ $t("asmTokenAddress") }}</span>
            <span>{{ $t("comOption") }}</span>
          </div>
          <div class="list-content">
            <div
              v-for="(item, i) in assetLists"
              :key="i"
              class="list-row"
              @click="listRowClick(i, item)"
              v-bind:class="{ 'active-row': activeRowIndex == i }"
            >
              <span>{{ i + 1 }}</span>
              <span>{{ item.name }}</span>
              <span>{{ item.address }}</span>
              <button @click="deleteRow(i)">
                <img
                  v-if="activeRowIndex == i"
                  src="../assets/img/deleteA.png"
                  alt=""
                />
                <img v-else src="../assets/img/delete.png" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
const Web3 = require("web3");
const ethers = require("ethers");
import myChain from "../components/myChain";
import global from "../assets/js/globalIP";
import { isTronAddress, GetTronContract } from "../assets/js/myWallet";
import bhpConst from "../assets/const/bhpConst";

export default {
  components: { myChain },
  data() {
    return {
      currentChain: "BHP",
      contractAbiAddress: "",
      assetLists: [],
      defaultAsset: { name: "", address: "", allAsset: 0, decimals: "" },
      newAsset: { name: "", address: "", allAsset: 0, decimals: "" },
      activeRowIndex: -1,
      loading: false,
    };
  },
  created() {
    for (let obj of JSON.parse(localStorage.getItem("assetLists"))) {
      switch (obj.chainName) {
        case "BHP":
          this.assetLists = obj.assets;
          break;
      }
    }
  },
  methods: {
    changeChain(val) {
      if (this.currentChain == val) return;

      this.assetLists = [];
      this.currentChain = val;
      this.activeRowIndex = -1;

      for (let obj of JSON.parse(localStorage.getItem("assetLists"))) {
        if (this.currentChain == obj.chainName) {
          this.assetLists = obj.assets;
        }
      }
    },
    listRowClick(rowIndex, row) {
      if (this.activeRowIndex == rowIndex) {
        this.activeRowIndex = -1;
      } else {
        this.activeRowIndex = rowIndex;
      }
    },
    deleteRow(i) {
      let that = this;
      for (let index in this.assetLists) {
        if (index == i) {
          that
            .$confirm("", that.$t("asmDeleteAssetMsg"), {
              dangerouslyUseHTMLString: true,
              confirmButtonText: that.$t("comOk"),
              cancelButtonText: that.$t("comCancel"),
              cancelButtonClass: "confirm-cancel",
              closeOnClickModal: false,
            })
            .then(() => {
              that.assetLists.splice(i, 1);

              let localAsset = JSON.parse(localStorage.getItem("assetLists"));
              for (let obj of localAsset) {
                if (obj.chainName == that.currentChain) {
                  obj.assets = that.assetLists;
                  break;
                }
              }

              localStorage.setItem("assetLists", JSON.stringify(localAsset));
              that.$refs.myMsg.openMessage(
                "success",
                that.$t("comDeleteSuccess")
              );
            })
            .catch((err) => {
              if (err != "cancel") {
                window.logger.verbose("Asset Management: delete - ");
                window.logger.error(err);
              }
            });
        }
      }
    },
    async addContract() {
      if (this.contractAbiAddress == "") return;
      this.loading = true;
      for (let index in this.assetLists) {
        if (this.assetLists[index].address == this.contractAbiAddress) {
          this.$refs.myMsg.openMessage(
            "warning",
            this.$t("asmContractAddrExist")
          );
          this.loading = false;
          return;
        }
      }

      switch (this.currentChain) {
        case "BHP":
          await this.addContractAbi();
          break;
        case "TRON":
          await this.addTronContract();
          break;
      }
      this.loading = false;
    },
    async addContractAbi() {
      let flag = true;

      if (!ethers.utils.isAddress(this.contractAbiAddress)) {
        this.$refs.myMsg.openMessage("error", this.$t("comAddrInvalid"));
        return;
      }

      if (ethers.utils.isAddress(this.contractAbiAddress)) {
        if (flag == true) {
          this.loading = true;
          let web3;
          if (typeof web3 !== "undefined") {
            web3 = await new Web3(web3.currentProvider);
          } else {
            web3 = await new Web3(
              new Web3.providers.HttpProvider(global.getIp())
            );
          }

          await web3.eth.getCode(this.contractAbiAddress).then((res) => {
            if (res === "0x") {
              this.$refs.myMsg.openMessage(
                "error",
                this.$t("asmContractAddrInvalid")
              );
            } else {
              let contractAddress = this.contractAbiAddress;
              // 定义合约abi

              // 定义合约
              let myContract = new web3.eth.Contract(
                bhpConst.bhpContractAbi,
                contractAddress
              );
              let that = this;
              myContract.methods.symbol().call({}, (error, result) => {
                if (!error) {
                  if (that.newAsset == null) {
                    that.newAsset = that.defaultAsset;
                  }
                  that.newAsset.name = result;
                  that.newAsset.address = contractAddress;
                  myContract.methods.decimals().call({}, (error, result) => {
                    if (!error) {
                      that.newAsset.decimals = result;
                      that.addLocal(that);
                    }
                  });
                }
              });
            }
            this.loading = false;
          });
        }
      } else {
        this.$refs.myMsg.openMessage(
          "error",
          this.$t("asmContractAddrInvalid")
        );
      }
    },
    async addTronContract() {
      let that = this;
      if (isTronAddress(that.contractAbiAddress)) {
        if (that.newAsset == null) {
          that.newAsset = that.defaultAsset;
        }
        await GetTronContract(that, that.contractAbiAddress);
        if (that.newAsset) {
          that.addLocal(that);
        }
      } else {
        that.$refs.myMsg.openMessage("error", that.$t("comAddrInvalid"));
      }
    },
    addLocal(that) {
      let isAdd = false;
      let localAsset = JSON.parse(localStorage.getItem("assetLists"));
      for (let obj of localAsset) {
        if (obj.chainName == that.currentChain) {
          obj.assets.push(that.newAsset);
          that.assetLists.push(that.newAsset);
          isAdd = true;
          break;
        }
      }
      if (!isAdd) {
        let asset = {
          chainName: that.currentChain,
          assets: [that.newAsset],
        };
        localAsset.push(asset);
        that.assetLists.push(that.newAsset);
      }
      that.$refs.myMsg.openMessage("sucess", that.$t("comAddSuccess"));
      localStorage.setItem("assetLists", JSON.stringify(localAsset));
      that.contractAbiAddress = "";
    },
  },
};
</script>

<style lang="less">
.assetsManage {
  .asset-top {
    height: 150px;
    padding: 30px;
    background: url("../assets/img/assetsBanner.png");
    background-size: 100% 100%;
    border-radius: 16px;

    p {
      margin: 0 0 30px;
      font-size: 20px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 400;
      color: #000000;
      line-height: 28px;
    }

    input {
      width: 467px;
      height: 40px;
      padding-left: 20px;
      margin-right: 20px;
      background: #fdfefe;
      border-radius: 20px;
      border: 1px solid #0676ed;
    }

    input::-webkit-input-placeholder {
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #d8d8d8;
      line-height: 16px;
    }

    button {
      width: 192px;
      height: 45px;
      background: #0676ed;
      box-shadow: 3px 3px 5px -1px rgba(11, 27, 102, 0.3);
      border-radius: 23px;
      font-size: 18px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #fff;
      line-height: 16px;
    }
  }

  .asset-list {
    p {
      margin: 47px 0 15px 37px;
      font-size: 20px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #000000;
      line-height: 28px;
    }

    .list-container {
      .list-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        height: 25px;
        font-size: 18px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 500;
        color: #747474;
        line-height: 25px;

        span {
          text-align: center;
        }
      }

      .list-content {
        height: calc(100vh - 445px);
        overflow-y: auto;

        .list-row {
          padding-right: 30px;
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          height: 53px;
          background: #ffffff;
          border-radius: 26px;

          span {
            text-align: center;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #747474;
            line-height: 20px;
          }

          button {
            background: none;

            img {
              width: 32px;
              height: 32px;
            }
          }
        }
      }

      span:nth-child(4n + 1) {
        flex-shrink: 0;
        width: 120px;
      }

      span:nth-child(4n + 2) {
        width: 120px;
        flex-basis: 20%;
      }

      span:nth-child(4n + 3) {
        width: 300px;
        flex-basis: 80%;
      }

      span:nth-child(4n + 4) {
        flex-shrink: 0;
        width: 100px;
      }

      .active-row {
        background: #0676ed !important;

        span {
          color: #ffffff !important;
        }
      }
    }
  }
}
</style>
