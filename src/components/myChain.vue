<template>
  <div class="choose-hain">
    <button
      v-bind:class="currentChain == 'BHP' ? 'active-chain-bhp' : ''"
      v-on:click="$emit('changeChain', 'BHP')"
    >
      <img src="../assets/img/logoBhp_31x31.png" alt="" />
      <span>BHP</span>
    </button>
    <button
      v-if="showFil"
      v-bind:class="currentChain == 'FIL' ? 'active-chain-fil' : ''"
      v-on:click="$emit('changeChain', 'FIL')"
    >
      <img src="../assets/img/logoFil_31x31.png" alt="" />
      <span>FIL</span>
    </button>
    <button
      v-bind:class="currentChain == 'TRON' ? 'active-chain-tron' : ''"
      v-on:click="$emit('changeChain', 'TRON')"
    >
      <img src="../assets/img/logoTron_31x31.png" alt="" />
      <span>TRON</span>
    </button>
  </div>
</template>
<script>
export default {
  props: {
    currentChain: { type: String },
    showFil: { type: Boolean, default: true },
  },
};
</script>
<style lang="less">
.choose-hain {
  height: 75px;
  display: flex;

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 16px;
    width: 130px;
    height: 50px;
    background: #c0c0c0;
    box-shadow: 0px 0px 10px 3px rgba(80, 165, 255, 0.2);
    border-radius: 12px;
    font-size: 18px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #fff;

    img {
      width: 31px;
      height: 31px;
      padding-right: 8px;
    }
  }

  .active-chain-bhp {
    background: #235ace;
  }
  .active-chain-fil {
    background: #31b2cc;
  }
  .active-chain-tron {
    background: #0676ed;
  }
}
</style>