<template>
  <div id="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>
<script>
import { initTron, initLog } from "./assets/js/globalInit";

export default {
  mounted() {
    initTron(this);
    initLog();
    window.logger.info("hello bhp gui");
  },
};
</script>
<style lang="less">
html,
body,
#app {
  width: 100%;
  height: 100%;
  min-width: 995px;
  min-height: 720px;
  margin: 0;
  padding: 0;
  @import "../src/assets/css/common.less";
  @import url("../src/assets/css/comDialog");
  @import url("../src/assets/css/comMsgBox");
}

.container-full {
  width: 100%;
  padding: 30px;
  background: #f4f9fd;
  overflow-y: auto;
  .title {
    height: 28px !important;
    margin-bottom: 15px;
    font-size: 20px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: #000000;
    line-height: 28px;
  }
}

.el-header,
.el-main {
  padding: 0 !important;
}

.load-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 200px;
    height: 200px;
  }
}
</style>
