<template>
  <div class="addressManage container-full">
    <div v-show="loading" class="load-overlay">
      <img src="../assets/img/loading.gif" alt="" />
    </div>
    <el-header class="title">
      <span>{{ $t("admBook") }}</span>
    </el-header>
    <my-chain :currentChain="currentChain" @changeChain="changeChain($event)">
    </my-chain>
    <el-main>
      <div class="address-top">
        <p>{{ $t("admAddAddress") }}</p>
        <div>
          <input
            type="text"
            :placeholder="$t('admToAddrP')"
            v-model="addressObj.address"
          />
          <input
            type="text"
            :placeholder="$t('admToAddrLabelP')"
            v-model="addressObj.name"
          />
          <button @click="addAddress()">{{ $t("comAdd") }}</button>
        </div>
      </div>
      <div class="address-list">
        <p>{{ $t("admAddrList") }}</p>
        <div class="list-container">
          <div class="list-header">
            <span>{{ $t("comNum") }}</span>
            <span>{{ $t("comAddrLabel") }}</span>
            <span>{{ $t("comAddress") }}</span>
            <span>{{ $t("comOption") }}</span>
          </div>
          <div class="list-content">
            <div
              v-for="(item, i) in addressList"
              :key="i"
              class="list-row"
              @click="listRowClick(i, item)"
              v-bind:class="{ 'active-row': activeRowIndex == i }"
            >
              <span>{{ i + 1 }}</span>
              <span>{{ item.name }}</span>
              <span>{{ item.address }}</span>
              <button @click="deleteRow(i, item)">
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
const ethers = require("ethers");
import myChain from "../components/myChain";
import { fil_validateaddress } from "../api/api";
import { isTronAddress } from "../assets/js/myWallet";

export default {
  components: { myChain },
  data() {
    return {
      currentChain: "BHP",
      addressObj: {
        name: "",
        address: "",
      },
      addressList: [],
      activeRowIndex: -1,
      loading: false,
    };
  },
  created() {
    let localAddr = localStorage.getItem("addressList") || '""';
    for (let obj of JSON.parse(localAddr)) {
      switch (obj.chainName) {
        case "BHP":
          this.addressList = obj.addresses;
          break;
      }
    }
  },
  methods: {
    changeChain(val) {
      if (this.currentChain == val) return;

      this.addressList = [];
      this.currentChain = val;
      this.activeRowIndex = -1;

      for (let obj of JSON.parse(localStorage.getItem("addressList") || '""')) {
        if (this.currentChain == obj.chainName) {
          this.addressList = obj.addresses;
        }
      }
    },
    addAddress() {
      let that = this;
      if (that.addressObj["name"] == "" || that.addressObj["address"] == "")
        return;

      for (let i in that.addressList) {
        if (that.addressList[i]["address"] == that.addressObj["address"]) {
          that.$refs.myMsg.openMessage("info", that.$t("admAddrExist"));
          return;
        }
      }

      switch (this.currentChain) {
        case "BHP":
          if (!that.addBHPAddress(that)) return;
          break;
        case "FIL":
          if (!that.addFILAddress(that)) return;
          break;
        case "TRON":
          if (!that.addTronAddress(that)) return;
          break;
        default:
          break;
      }
    },
    addLocal(that) {
      let isAdd = false;
      let addressList =
        JSON.parse(localStorage.getItem("addressList") || '""') || [];

      for (let obj of addressList) {
        if (that.currentChain == obj.chainName) {
          obj.addresses.push(this.addressObj);
          isAdd = true;
          break;
        }
      }

      if (!isAdd) {
        addressList.push({
          chainName: that.currentChain,
          addresses: [that.addressObj],
        });
      }

      localStorage.setItem("addressList", JSON.stringify(addressList));

      that.addressList.push(that.addressObj);
      that.addressObj = {
        name: "",
        address: "",
      };

      that.$refs.myMsg.openMessage("success", that.$t("comAddSuccess"));
    },
    addBHPAddress(that) {
      if (!ethers.utils.isAddress(that.addressObj["address"])) {
        that.$refs.myMsg.openMessage("error", that.$t("comAddrInvalid"));
      } else {
        that.addLocal(that);
      }
    },
    addFILAddress(that) {
      that.loading = true;
      fil_validateaddress(that.addressObj["address"]).then((res) => {
        if (res.data.error) {
          that.$refs.myMsg.openMessage("error", that.$t("comAddrInvalid"));
        } else {
          that.addLocal(that);
        }
      });
      that.loading = false;
    },
    addTronAddress(that) {
      if (isTronAddress(that.addressObj["address"])) {
        that.addLocal(that);
      } else {
        that.$refs.myMsg.openMessage("error", that.$t("comAddrInvalid"));
      }
    },
    listRowClick(rowIndex, row) {
      if (this.activeRowIndex == rowIndex) {
        this.activeRowIndex = -1;
      } else {
        this.activeRowIndex = rowIndex;
      }
    },
    deleteRow(rowIndex, row) {
      let that = this;
      that
        .$confirm("", that.$t("admAddrDeleteMsg"), {
          dangerouslyUseHTMLString: true,
          confirmButtonText: that.$t("comOk"),
          cancelButtonText: that.$t("comCancel"),
          cancelButtonClass: "confirm-cancel",
           closeOnClickModal: false,
        })
        .then(() => {
          that.addressList.splice(rowIndex, 1);

          let localAddr =
            JSON.parse(localStorage.getItem("addressList") || '""') || [];

          for (let obj of localAddr) {
            if (that.currentChain == obj.chainName) {
              obj.addresses = that.addressList;
              break;
            }
          }

          localStorage.setItem("addressList", JSON.stringify(localAddr));
          that.$refs.myMsg.openMessage("success", that.$t("comDeleteSuccess"));
        })
        .catch((err) => {
          if (err != "cancel") {
            window.logger.verbose("Address Management: delete - ");
            window.logger.error(err);
          }
        });
    },
  },
};
</script>

<style lang="less">
.addressManage {
  .address-top {
    height: 150px;
    padding: 30px;
    background: url("../assets/img/addressBanner.png");
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
      width: 345px;
      height: 40px;
      padding-left: 20px;
      background: #fdfefe;
      border-radius: 20px;
      border: 1px solid #0676ed;
    }

    input:nth-child(2) {
      width: 225px;
      margin: 0 20px 0 30px;
    }

    input::-webkit-input-placeholder {
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #d8d8d8;
      line-height: 16px;
    }

    button {
      width: 150px;
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

  .address-list {
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
        height: calc(100vh - 505px);
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
