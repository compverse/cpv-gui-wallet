<template>
  <div class="transfer container-full">
    <el-header class="title">
      <span style="font-weight: 600">{{ $t("comTransfer") }}</span>
    </el-header>
    <div class="switch-btn">
      <div>
        <button
          v-bind:class="isSingle ? 'switch-active' : ''"
          @click="changeSwitch(true)"
        >
          {{ $t("comTransfer") }}
        </button>
        <button
          v-bind:class="isSingle ? '' : 'switch-active'"
          @click="changeSwitch(false)"
        >
          {{ $t("transBatchTrans") }}
        </button>
      </div>
    </div>

    <single-transfer v-if="isSingle" class="signal-t"></single-transfer>

    <batch-transfer v-else class="batch-t"></batch-transfer>
  </div>
</template>

<script>
import SingleTransfer from "./SingleTransfer";
import BatchTransfer from "./BatchTransfer";
export default {
  components: {
    SingleTransfer,
    BatchTransfer,
  },
  data() {
    return {
      isSingle: true,
    };
  },
  mounted() {
    window.logger.info("hello transfer");
  },
  methods: {
    changeSwitch(isSingle) {
      if (this.isSingle == isSingle) return;
      if (isSingle) {
        //signal transfer
        this.isSingle = true;
      } else {
        //batch transfer
        this.isSingle = false;
      }
    },
  },
};
</script>

<style lang="less">
.transfer {
  display: flex;
  flex-direction: column;
  .el-header {
    padding: 30px 0 0 30px;
  }

  .title {
    flex-shrink: 0;
  }

  .switch-btn {
    flex-shrink: 0;
    text-align: center;
    padding-bottom: 20px;

    div {
      display: inline-block;
      width: 244px;
      padding: 3px 1px;
      background: #ffffff;
      border-radius: 17px;
      border: 1px solid #0676ed;

      button {
        width: 120px;
        height: 27px;
        background: #ffffff;
        border-radius: 15px;
        border: 1px solid #0676ed;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        line-height: 22px;
        color: #999;
      }

      .switch-active {
        background: #0676ed;
        color: #ffffff;
      }
    }
  }
  .signal-t {
    flex-basis: 100%;
  }

  .batch-t {
    flex-basis: 100%;
  }
}
</style>
