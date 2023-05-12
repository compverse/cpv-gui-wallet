<template>
  <div class="login">
    <div class="main-container">
      <div class="title">
        <img src="../assets/img/loginLogo.png" alt="" />
        <span>BHP GUI</span>
      </div>
      <div class="btns">
        <button class="btn1" @click="openWallet()">
          {{ $t("loginOpenWallet") }}
        </button>
        <button class="btn2" @click="createWallet()">
          {{ $t("loginCreateWallet") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    openWallet() {
      this.$router.push("openWallet");
    },
    createWallet() {
      this.$router.push("createWallet");
    },
  },
};
</script>

<style lang="less">
.login {
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

    .btns {
      display: flex;
      flex-direction: column;
      align-items: center;

      button {
        width: 397px;
        height: 54px;
        border-radius: 38px;
        font-size: 20px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        line-height: 28px;
      }

      .btn1 {
        background: #0676ed;
        color: #ffffff;
      }

      .btn2 {
        margin-top: 22px;
        background: #ffffff;
        border: 2px solid #0676ed !important;
        color: #0676ed;
      }
    }
  }
}
</style>
