<template>
  <div class="create-wallet">
    <div class="main-container">
      <div class="title">
        <img src="../assets/img/loginLogo.png" alt="" />
        <span>BHP GUI</span>
      </div>
      <div class="content">
        <div class="content1">
          <div @click="createFile()">
            <img src="../assets/img/chooseFile.png" alt="" />
            <input
              type="text"
              :placeholder="$t('cwSaveWalletP')"
              v-model="filePath"
              disabled
            />
          </div>
        </div>
        <div class="content2">
          <input
            type="password"
            v-model="password"
            @blur="checkPwd()"
            :placeholder="$t('comInputPw')"
          />
          <img src="../assets/img/password.png" alt="" />
          <div class="msgDiv">
            <span v-show="prompt2">{{ $t("cwPwMsg") }}</span>
          </div>
        </div>
        <div class="content3">
          <input
            type="password"
            v-model="againPassword"
            @input="checkAgainPwd()"
            :placeholder="$t('cwConfirmPw')"
          />
          <img src="../assets/img/password.png" alt="" />
          <div class="msgDiv">
            <span v-show="prompt3">{{ $t("cwPwMsg2") }}</span>
          </div>
        </div>
      </div>
      <div class="btns">
        <button class="btn1" @click="goBack()">{{ $t("comBack") }}</button>
        <button class="btn2" @click="toHome()">{{ $t("cwCreate") }}</button>
      </div>
    </div>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
import {
  createMnemonic,
  bhpCreateWallet,
  filCreateWallet,
  tronCreateAccount,
} from "../assets/js/createWallet";
const { remote } = window.require("electron");
const { dialog } = remote;
const fs = window.require("fs");
export default {
  data() {
    return {
      filePath: "",
      bhpWalletObj: {},
      filWalletObj: {},
      tronAccountObj: {},
      walletList: [],
      password: "",
      againPassword: "",
      prompt2: false,
      prompt3: false,
    };
  },
  methods: {
    createFile() {
      let that = this;
      dialog
        .showSaveDialog({
          title: that.$t("createWallet"),
          defaultPath: "/",
          filters: [
            {
              name: "JSON",
              extensions: ["json"],
            },
          ],
        })
        .then(function (res) {
          if (res.filePath != "") {
            that.filePath = res.filePath;
          }
        })
        .catch(function (error) {
          that.$refs.myMsg.openMessage("error", error);
        });
    },
    goBack() {
      this.$router.push("/");
    },
    async toHome() {
      if (!this.filePath) {
        this.$refs.myMsg.openMessage("error", this.$t("cwPwMsg3"));
      }
      if (
        this.password &&
        this.againPassword &&
        this.filePath &&
        !this.prompt2 &&
        !this.prompt3
      ) {
        let that = this;
        if (that.filePath == "") return;

        try {
          let mnemonic = createMnemonic();
          bhpCreateWallet(this, mnemonic);
          this.walletList.push(this.bhpWalletObj);
          await filCreateWallet(this, mnemonic);
          this.walletList.push(this.filWalletObj);
          await tronCreateAccount(this);
          this.walletList.push(this.tronAccountObj);
          let json = JSON.stringify(this.walletList);
          fs.writeFile(that.filePath, json, (err) => {
            if (err) {
              that.$refs.myMsg.openMessage("error", err);
            } else {
              sessionStorage.setItem(
                "bhpWalletList",
                JSON.stringify(that.walletList)
              );
              sessionStorage.setItem("filePath", that.filePath);
              window.logger.info("create to home");
              this.$router.push("/homeIndex");
            }
          });
        } catch (err) {
          console.log(err);
          that.$refs.myMsg.openMessage("error", that.$t("comCreateAccountErr"));
        }
      }
    },
    checkPwd() {
      this.prompt3 = true;
      // var regstr = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,30}$/;
      // if (!regstr.test(this.password)) {
      //   this.prompt2 = true;
      // } else {
      //   this.prompt2 = false;
      // }
      this.password = this.password.trim();
      if (this.password.length < 8 || this.password.length > 30) {
        this.prompt2 = true;
      } else {
        this.prompt2 = false;
      }
      this.checkAgainPwd();
    },
    checkAgainPwd() {
      if (this.againPassword != this.password) {
        this.prompt3 = true;
      } else {
        this.prompt3 = false;
      }
    },
  },
};
</script>

<style lang="less">
.create-wallet {
  height: 100%;
  background: url("../assets/img/loginBg.png");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .main-container {
    width: 592px;
    height: 460px;
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
      .content1,
      .content2,
      .content3 {
        margin-top: 22px;
        position: relative;

        img {
          width: 26px;
          height: 26px;
          position: absolute;
          left: 30px;
          top: 14px;
        }
      }
      .msgDiv {
        height: 10px;
        padding-left: 16px;
        span {
          font-size: 14px;
          color: red;
        }
      }
      .content1 {
        margin-top: 0;
      }
      .content2 {
        margin-top: 32px;
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

      .msgDiv {
        span {
          padding-left: 15px;
          padding-right: 15px;
          font-size: 12px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: red;
          line-height: 16px;
          white-space: pre;
        }
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
