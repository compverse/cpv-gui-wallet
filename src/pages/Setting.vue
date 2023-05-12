<template>
  <div class="setting container-full">
    <el-header class="title">
      <span>{{ $t("setting") }}</span>
    </el-header>
    <el-main class="main-container">
      <div class="main">
        <p>{{ $t("setGeneral") }}</p>
        <div class="content">
          <span class="left-label">{{ $t("setNet") }}</span>
          <el-radio
            class="context"
            v-model="chooseNet"
            label="mainNet"
            @change="changeNet('mainNet')"
          >
            {{ $t("setMainNet") }}
          </el-radio>
          <el-radio
            class="context"
            v-model="chooseNet"
            label="testNet"
            @change="changeNet('testNet')"
          >
            {{ $t("setTestNet") }}
          </el-radio>
        </div>
        <div>
          <span class="left-label">{{ $t("setLanguage") }}</span>
          <el-radio
            class="context"
            v-model="chooseLang"
            label="zh-cn"
            @change="changeLang('zh-cn')"
          >
            中文
          </el-radio>
          <el-radio
            class="context"
            v-model="chooseLang"
            label="en-us"
            @change="changeLang('en-us')"
          >
            Engilsh
          </el-radio>
        </div>
        <p>{{ $t("setAbout") }}</p>
        <div class="content">
          <span class="left-label">{{ $t("setVersion") }} </span>
          <span class="context">V 1.0.4</span>
          <button class="version-update" @click="versionUpdate()">
            {{ $t("setVersionUpdate") }}
          </button>
        </div>
        <div class="content">
          <span class="left-label">{{ $t("setWeb") }}</span>
          <a class="context" href="https://www.bhpnet.io/">
            https://www.bhpnet.io/
          </a>
        </div>
        <div class="content">
          <span class="left-label">Github</span>
          <a class="context" href="https://github.com/bhpnet/bhp-gui">
            https://github.com/bhpnet/bhp-gui
          </a>
        </div>
        <el-button class="login-out" @click="loginOut()">
          {{ $t("setLoginOut") }}
        </el-button>
      </div>
    </el-main>

    <my-message ref="myMsg"></my-message>
  </div>
</template>
<script>
import globalIP from "../assets/js/globalIP";
const { ipcRenderer } = window.require("electron");

export default {
  data() {
    return {
      chooseNet: "",
      chooseLang: localStorage.getItem("language"),
    };
  },
  mounted() {
    this.chooseNet = localStorage.getItem("network");
    if (this.chooseNet == null || this.chooseNet == "") {
      globalIP.changeNet("mainNet");
      this.chooseNet = localStorage.getItem("network");
    }
  },
  methods: {
    changeNet(val) {
      if (val == "testNet") {
        this.chooseNet = "testNet";
      } else {
        this.chooseNet = "mainNet";
      }
      globalIP.changeNet(val);
    },
    changeLang(val) {
      localStorage.setItem("language", val);
      this.$i18n.locale = val;
    },
    versionUpdate() {
      const that = this;
      ipcRenderer.send("checkForUpdate");
      ipcRenderer.on("message", (event, text) => {
        // console.log(arguments);
        // that.tips = text;
        console.log(text);
        if (text == "setUpdateNone") {
          that.$refs.myMsg.openMessage("info", that.$t(text));
        }
      });
      ipcRenderer.on("downloadProgress", (event, progressObj) => {
        console.log(progressObj);
        // that.downloadPercent = progressObj.percent || 0;
      });
      ipcRenderer.on("isUpdateNow", () => {
        that
          .$confirm(that.$t("setUpdateNow"), that.$t("setVersionUpdate"), {
            dangerouslyUseHTMLString: true,
            confirmButtonText: that.$t("comOk"),
            cancelButtonText: that.$t("comCancel"),
            cancelButtonClass: "confirm-cancel",
            closeOnClickModal: false,
          })
          .then(() => {
            ipcRenderer.send("updateNow");
          })
          .catch((err) => {
            if (err != "cancel") {
              window.logger.verbose("ipcRenderer isUpdateNow confirm: ");
              window.logger.error(err);
              that.$refs.myMsg.openMessage("error", err);
            }
          });
      });
    },
    loginOut() {
      window.logger.info("login out bhp gui");
      sessionStorage.setItem("bhpWalletList", JSON.stringify([]));
      this.$router.push("/");
    },
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners([
      "message",
      "downloadProgress",
      "isUpdateNow",
    ]); //remove只能移除单个事件，单独封装removeAll移除所有事件
  },
};
</script>
<style lang="less">
.setting {
  display: flex;
  flex-direction: column;

  .main-container {
    flex-basis: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .main {
      width: 600px;
      height: 490px;
      background: #fdfefe;
      border-radius: 13px 13px 0px 0px;

      p {
        margin: 0;
        padding: 40px 0 23px 65px;
        font-size: 18px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 25px;
      }

      .content {
        padding-bottom: 36px;
      }

      .left-label {
        display: inline-block;
        padding-left: 105px;
        width: 140px;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #747474;
        line-height: 16px;
      }

      .context {
        width: 150px;
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 22px;
      }

      .version-update {
        margin-left: 20px;
      }

      a {
        text-decoration: none;
        margin-left: -5px;
      }

      .login-out {
        width: 180px;
        height: 36px;
        margin-left: 210px;
        background: #ff3d3d;
        box-shadow: 3px 3px 10px -1px rgba(11, 27, 102, 0.17);
        border-radius: 20px;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}

.el-radio__label {
  font-size: 16px;
}
</style>