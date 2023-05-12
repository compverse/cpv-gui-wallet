<template>
  <div class="open-wallet">
    <div class="main-container">
      <div class="title">
        <img src="../assets/img/loginLogo.png" alt="" />
        <span>BHP GUI</span>
      </div>
      <div class="content">
        <div class="content1">
          <div @click="openFile()">
            <img src="../assets/img/chooseFile.png" alt="" />
            <input
              type="text"
              :placeholder="$t('owChooseWalletP')"
              v-model="filePath"
              disabled
            />
          </div>
        </div>
        <div class="content2">
          <input
            type="password"
            v-model="password"
            :placeholder="$t('comInputPw')"
          />
          <img src="../assets/img/password.png" alt="" />
        </div>
      </div>
      <div class="btns">
        <button class="btn1" @click="goBack()">{{ $t("comBack") }}</button>
        <button class="btn2" @click="toHome()">{{ $t("comOk") }}</button>
      </div>
    </div>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
const { remote } = window.require("electron");
const { dialog } = remote;
const fs = window.require("fs");
import Utils from "../assets/js/utils";

export default {
  data() {
    return {
      filePath: "",
      password: "",
      walletList: [],
    };
  },
  methods: {
    openFile() {
      let that = this;
      dialog
        .showOpenDialog({
          title: that.$t("owChooseWallet"),
          defaultPath: "/",
          filters: [
            {
              name: "JSON",
              extensions: ["json"],
            },
          ],
        })
        .then(function (res) {
          if (res.filePaths[0] != undefined) {
            that.filePath = res.filePaths[0];
            let file = fs.readFileSync(res.filePaths[0], "utf8");
            that.walletList = JSON.parse(file);
          }
        })
        .catch(function (error) {
          that.filePath = "";
          that.$refs.myMsg.openMessage("error", that.$t("owOpenFailed"));
        });
    },
    goBack() {
      this.$router.push("/");
    },
    toHome() {
      if (this.filePaths == "" || this.password == "") return;
      let that = this;
      try {
        let isEmptyWallet = true;
        for (let i in that.walletList) {
          if (that.walletList[i].accounts.length > 0) {
            isEmptyWallet = false;
            Utils.decryptContent(
              that.walletList[i].accounts[0].privateKey,
              that.password
            );
            sessionStorage.setItem(
              "bhpWalletList",
              JSON.stringify(that.walletList)
            );
            sessionStorage.setItem("filePath", that.filePath);
            window.logger.info("open to home");
            that.$router.push("/homeIndex");
            break;
          }
        }
        if (isEmptyWallet)
          that.$refs.myMsg.openMessage("info", that.$t("owEmptyWallet"));
      } catch (err) {
        that.password = "";
        that.$refs.myMsg.openMessage("error", that.$t("comPasswordError"));
      }
    },
  },
};
</script>

<style lang="less">
.open-wallet {
  height: 100%;
  background: url("../assets/img/loginBg.png");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .main-container {
    width: 592px;
    height: 360px;
    background: #ffffff;
    border-radius: 29px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    .title {
      display: flex;
      justify-content: center;

      img {
        width: 46px;
        height: 46px;
        padding-right: 9px;
      }

      span {
        font-size: 28px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #5b5b5b;
        line-height: 46px;
      }
    }

    .content {
      .content2 {
        margin-top: 22px;
      }
      .content1,
      .content2 {
        position: relative;
        img {
          width: 26px;
          height: 26px;
          position: absolute;
          left: 30px;
          top: 14px;
        }
      }
      input {
        width: 397px;
        height: 54px;
        background: #fdfefe;
        border-radius: 27px;
        border: 1px solid #0676ed;
        box-sizing: border-box;
        text-indent: 66px;
        font-size: 18px;
      }
      input::-webkit-input-placeholder {
        color: #d8d8d8;
        font-size: 18px;
      }
      input::-moz-input-placeholder {
        color: #d8d8d8;
        font-size: 18px;
      }
      input::-ms-input-placeholder {
        color: #d8d8d8;
        font-size: 18px;
      }
    }

    .btns {
      button {
        width: 191px;
        height: 54px;
        border-radius: 38px;
        font-size: 20px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        line-height: 28px;
      }
    }

    .btn1 {
      border: 2px solid #0676ed;
      color: #0676ed;
    }

    .btn2 {
      margin-left: 14px;
      background: #0676ed;
      color: #ffffff;
    }
  }
}
</style>
