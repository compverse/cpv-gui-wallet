<template>
  <div class="indexHome">
    <div class="leftDiv">
      <div class="menu">
        <div
          @click="toTab('home')"
          :class="currentMenu == 'home' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'home'"
            src="../assets/img/home.png"
            alt
          />
          <img
            v-show="currentMenu == 'home'"
            src="../assets/img/homeA.png"
            alt
          />
        </div>
        <div
          @click="toTab('transfer')"
          :class="currentMenu == 'transfer' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'transfer'"
            src="../assets/img/transfer.png"
            alt
          />
          <img
            v-show="currentMenu == 'transfer'"
            src="../assets/img/transferA.png"
            alt
          />
        </div>
        <div
          @click="toTab('accountManagement')"
          :class="currentMenu == 'accountManagement' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'accountManagement'"
            src="../assets/img/accounts.png"
            alt
          />
          <img
            v-show="currentMenu == 'accountManagement'"
            src="../assets/img/accountsA.png"
            alt
          />
        </div>
        <div
          @click="toTab('assetManagement')"
          :class="currentMenu == 'assetManagement' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'assetManagement'"
            src="../assets/img/assets.png"
            alt
          />
          <img
            v-show="currentMenu == 'assetManagement'"
            src="../assets/img/assetsA.png"
            alt
          />
        </div>
        <div
          @click="toTab('addressManagement')"
          :class="currentMenu == 'addressManagement' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'addressManagement'"
            src="../assets/img/addresses.png"
            alt
          />
          <img
            v-show="currentMenu == 'addressManagement'"
            src="../assets/img/addressesA.png"
            alt
          />
        </div>
        <div
          @click="toTab('setting')"
          :class="currentMenu == 'setting' ? 'active' : ''"
        >
          <img
            v-show="currentMenu != 'setting'"
            src="../assets/img/setting.png"
            alt
          />
          <img
            v-show="currentMenu == 'setting'"
            src="../assets/img/settingA.png"
            alt
          />
        </div>
      </div>
    </div>
    <div class="rightDiv">
      <el-container class="right-container">
        <router-view />
      </el-container>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentMenu: "home",
      currentWallet: "",
      currentAddress: "",
      version: "V0.01",
      bhpWalletList: "",
    };
  },
  created() {
    this.currentMenu = location.hash.replace("#/", "");
    this.bhpWalletList = JSON.parse(sessionStorage.getItem("bhpWalletList"));
    if (this.bhpWalletList == [] || !this.bhpWalletList) {
      this.$router.push("/");
    }
    if (this.currentMenu.indexOf("?") != -1) {
      this.currentMenu = this.currentMenu.slice(
        0,
        this.currentMenu.indexOf("?")
      );
    }

    if (this.currentMenu == "transfered") {
      this.currentMenu = "transfer";
    }
  },

  methods: {
    toTab(val) {
      if (this.currentMenu == val) return;
      this.currentMenu = val;
      this.$router.push({
        path: "/" + val,
        query: {
          address2: this.$route.query.address2,
        },
      });
    },
  },
};
</script>

<style lang="less">
.indexHome {
  height: 100%;
  display: flex;

  .leftDiv {
    position: relative;
    flex-shrink: 0;
    width: 76px;

    .menu {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      box-shadow: 0px 2px 12px 0px rgba(46, 63, 114, 0.13);

      div {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;

        img {
          width: 28px;
          height: 28px;
        }
      }

      .active {
        background: #e4f0fc;
      }
    }
  }

  .rightDiv {
    width: 100%;
    background: #f5f6fa;

    .right-container {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
