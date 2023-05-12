<template>
  <div></div>
</template>
<script>
export default {
  data() {
    return {
      msgSuccessImg: require("../assets/img/msgSuccess.png"),
      msgErrorImg: require("../assets/img/msgError.png"),
      msgInfoImg: require("../assets/img/msgInfo.png"),
    };
  },
  methods: {
    openMessage(type, text) {
      let imgUrl = this.msgInfoImg;
      switch (type) {
        case "success":
          imgUrl = this.msgSuccessImg;
          break;
        case "error":
          imgUrl = this.msgErrorImg;
          break;
        default:
          break;
      }
      this.$message({
        dangerouslyUseHTMLString: true,
        message:
          '<img src="' +
          imgUrl +
          '" class="msg-img" alt="" /><span>' +
          text +
          "</span>",
        center: true,
        customClass: "toast-msg",
        iconClass: "msg-img",
        duration: 2000,
      });
    },
  },
};
</script>
<style lang="less">
.toast-msg {
  top: 50% !important;
  width: 244px;
  height: 60px;
  background: #ffffff;
  box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.12);
  border-radius: 30px;

  .msg-img {
    padding-right: 12px;
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }

  span {
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 16px;
  }
}
</style>