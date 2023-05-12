<template>
  <div class="transfered">
    <h2>{{ $t("comTransfer") }}</h2>
    <img src="../assets/img/transfering.png" alt="" />
    <p>{{ $t("transfQueuing") }}</p>
    <div class="main">
      <h3>{{ $t("transfTxDetails") }}</h3>
      <p><span>{{ $t("comCoinType") }}：</span>{{$route.query.comCoinType}}</p>
      <p><span>{{ $t("transfCoin") }}：</span>{{$route.query.amount}} {{$route.query.currentAsset}}</p>
      <p><span>{{ $t("transfPayAddress") }}：</span>{{$route.query.transfPayAddress}}</p>
      <p><span>{{ $t("transfToAddr") }}：</span>{{$route.query.transfToAddr}}</p>
      <p class="txHash"><span>{{ $t("transfTxHash") }}：</span><i>{{$route.query.transfTxHash}}</i></p>
    </div>
  </div>
</template>

<script>
export default {                  
};
</script>

<style lang="less" scoped>
.transfered {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  h2 {
    font-size: 20px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #000000;
    padding: 40px 0 0 30px;
    margin: 0 0 21px 0;
    align-self: flex-start;
  }
  img {
    width: 190px;
    height: 200px;
  }
  p {
    font-size: 22px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #747474;
    margin: 0 0 22px 0;
  }
  .main {
    width: 653px;
    height: 360px;
    background: url("../assets/img/recordBackground.png") no-repeat;
    background-size: cover;
    padding-right: 40px;
    h3 {
      padding: 46px 0 40px 58px;
      margin: 0;
      font-size: 24px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #666666;
      line-height: 24px;
    }
    p {
      // height: 25px;
      font-size: 15px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #666666;
      line-height: 20px;
      margin: 16px 0 0 0;
      padding-left: 58px;
      word-break:break-all;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span{
        width: 150px;
        margin-right: 50px;
      }
    }
     .txHash{
        align-items: flex-start;
        i{
        width: calc(100% - 233px);
        font-style: normal;
        }
      }
  }
}
</style>
