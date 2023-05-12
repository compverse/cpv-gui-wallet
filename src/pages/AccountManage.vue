<template>
  <div class="accountManage container-full">
    <el-header class="title">
      <span>{{ $t("amTitle") }}</span>
    </el-header>
    <my-chain
      :currentChain="currentChain"
      @changeChain="changeChain($event)"
      class="choose-chain"
    >
    </my-chain>
    <div class="top-btn">
      <p>{{ $t("amAccountList") }}</p>
      <div class="account-opt">
        <button
          @click="createAccount()"
          v-bind:class="currentLang == 'en-us' ? 'encss-account' : ''"
        >
          <img src="../assets/img/createAccount.png" alt="" />{{
            $t("amCreateAccount")
          }}
        </button>
        <button
          @click="importPriKey()"
          v-show="true"
          v-bind:class="currentLang == 'en-us' ? 'encss-account' : ''"
        >
          <img src="../assets/img/importPriKey.png" alt="" />{{
            $t("amImportPriKey")
          }}
        </button>
        <!-- <button
          v-show="!showTab"

          @click="importMnemonic()"
          v-bind:class="currentLang == 'en-us' ? 'encss-account' : ''"
        >
          <img src="../assets/img/importPriKey.png" alt="" />{{
            '导入助记词'
          }}
        </button> -->
      </div>
    </div>
    <el-main class="main-container">
      <el-table
        :data="tableData"
        :header-row-class-name="headerRowClass"
        :header-cell-class-name="headerCellClass"
        :row-class-name="rowClass"
        :cell-class-name="cellClass"
        height="100%"
      >
        <el-table-column prop="address" width="480" :label="$t('comAddress')">
          <template slot-scope="scope">
            {{ scope.row.address }}
            <img
              class="edit-img"
              src="../assets/img/copy.png"
              alt=""
              v-on:click="copyAddress(scope.row, scope.$index)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('comAddrLabel')">
          <template slot-scope="scope">
            {{ scope.row.name }}
            <img
              class="edit-img"
              src="../assets/img/edit.png"
              alt=""
              v-on:click="editAddrLabel(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('comOption')" width="155">
          <template slot-scope="scope">
            <button
              class="table-opt"
              @click="viewPriKey(scope.row, scope.$index)"
            >
              <img src="../assets/img/viewPri.png" alt="" />
            </button>
            <button
              class="table-opt"
              @click="deleteAddr(scope.row, scope.$index)"
            >
              <img src="../assets/img/delete.png" alt="" />
            </button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <el-dialog
      :title="$t('amCreateAccount')"
      :visible.sync="showCreate"
      :before-close="createAccountCancel"
      :close-on-click-modal="false"
      class="create-dialog"
      v-bind:class="currentLang == 'en-us' ? 'encss-dialog-label' : ''"
    >
      <el-form>
        <el-form-item :label="$t('comAddrLabel')">
          <el-input v-model="createAddrLabel" :placeholder="$t('amAddrLableP')">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('comPassword')">
          <el-input
            v-model="password"
            type="password"
            :placeholder="$t('comPasswordP')"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button class="btn-cancel" @click="createAccountCancel()">
          {{ $t("comCancel") }}
        </el-button>
        <el-button @click="createAccountOk()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('amImportPriKey')"
      :visible.sync="showImport"
      :before-close="importPriKeyCancel"
      :close-on-click-modal="false"
      class="import-dialog"
      v-bind:class="currentLang == 'en-us' ? 'encss-dialog-label' : ''"
    >
      <el-form>
        <el-form-item :label="$t('comPriKey')">
          <el-input v-model="newPriKey" :placeholder="$t('amPriKeyP')">
            <img
              class="prikey-img"
              slot="prefix"
              src="../assets/img/privateKey.png"
              alt=""
            />
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('comAddrLabel')">
          <el-input v-model="newAddrLabel" :placeholder="$t('amAddrLableP')">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('comPassword')">
          <el-input
            v-model="password"
            type="password"
            :placeholder="$t('comPasswordP')"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button class="btn-cancel" @click="importPriKeyCancel()">
          {{ $t("comCancel") }}
        </el-button>
        <el-button @click="importPriKeyOk()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <!-- <el-dialog
      title="导入助记词"
      :visible.sync="showImport1"
      :before-close="importMnemonicCancel"
      class="import-dialog"
    >
      <el-form label-width="160px">
        <el-form-item label="助记词">
          <el-input v-model="newPriKey" placeholder="请输入你的助记词">
            <img
              class="prikey-img"
              slot="prefix"
              src="../assets/img/privateKey.png"
              alt=""
            />
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('comAddrLabel')">
          <el-input v-model="newAddrLabel" :placeholder="$t('amAddrLableP')">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('comPassword')">
          <el-input
            v-model="password"
            type="password"
            :placeholder="$t('comPasswordP')"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button class="btn-cancel" @click="importMnemonicCancel()">
          {{ $t("comCancel") }}
        </el-button>
        <el-button @click="importMnemonicOk()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog> -->

    <el-dialog
      :title="$t('amEditAddrLabel')"
      :visible.sync="showLabel"
      :before-close="editAddrLabelCancel"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="newLabel"
        :placeholder="$t('amEditAddrLabelP')"
      ></el-input>
      <span slot="footer">
        <el-button class="btn-cancel" @click="editAddrLabelCancel()">
          {{ $t("comCancel") }}
        </el-button>
        <el-button @click="editAddrLabelOk()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('amViewPriKey')"
      :visible.sync="showPriKey"
      :before-close="viewPriKeyCancel"
      :close-on-click-modal="false"
      class="pri-dialog"
    >
      <p class="dia-row">
        {{ $t("amViewPriKeyMsg") }}
      </p>
      <div class="dia-row">
        <span
          class="pri-title"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-title' : ''"
          >{{ $t("comAddrLabel") }} :</span
        >
        <span
          class="pri-text"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-text' : ''"
          >{{ showPriKeyData.name }}</span
        >
      </div>
      <div class="dia-row">
        <span
          class="pri-title"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-title' : ''"
          >{{ $t("comAddress") }} :</span
        >
        <span
          class="pri-text"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-text' : ''"
          >{{ showPriKeyData.address }}</span
        >
      </div>
      <div class="dia-row">
        <span
          class="pri-title"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-title' : ''"
          >{{ $t("comPriKey") }} :</span
        >
        <span
          class="pri-text"
          v-bind:class="currentLang == 'en-us' ? 'encss-pri-text' : ''"
          >{{ showPriKeyData.privateKey }}</span
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('comPasswordP')"
      :visible.sync="show1"
      :before-close="closePassword"
      :close-on-click-modal="false"
    >
      <el-input v-model="password" type="password"></el-input>
      <span slot="footer">
        <el-button class="btn-cancel" @click="closePassword()">
          {{ $t("comCancel") }}</el-button
        >
        <el-button @click="surePassword()">{{ $t("comOk") }}</el-button>
      </span>
    </el-dialog>

    <my-message ref="myMsg"></my-message>
  </div>
</template>

<script>
import {
  createMnemonic,
  bhpCreateWallet,
  bhpLeadPriKey,
  filCreateWallet,
  filLeadPriKey,
  tronCreateAccount,
  tronLeadPriKey,
} from "../assets/js/createWallet";
const fs = window.require("fs");
import Utils from "../assets/js/utils";
import myChain from "../components/myChain";

export default {
  components: { myChain },
  data() {
    return {
      currentLang: localStorage.getItem("language"),
      currentChain: "BHP",
      showCreate: false,
      createAddrLabel: "",
      showImport: false,
      showImport1: false,
      newPriKey: "",
      newAddrLabel: "",
      password: "",
      showLabel: false,
      editIndex: "",
      newLabel: "",
      showPriKey: false,
      showPriKeyData: {},
      tableData: [], //当前链钱包数组
      passData: [], //验证密码的数组
      bhpWalletObj: {},
      filWalletObj: {},
      tronAccountObj: {},
      filePath: "",
      show1: false,
      privateKey: "",
      passFlog: "",
      showTab: true,
    };
  },
  created() {
    for (let obj of JSON.parse(sessionStorage.getItem("bhpWalletList"))) {
      if (obj.accounts.length > 0) {
        this.passData = obj.accounts;
      }
      switch (obj.chainName) {
        case "BHP":
          this.tableData = obj.accounts;
          break;
      }
    }
    this.filePath = sessionStorage.getItem("filePath");
  },
  methods: {
    changeChain(val) {
      if (this.currentChain == val) return;

      this.tableData = [];

      switch (val) {
        case "FIL":
          this.currentChain = "FIL";
          // this.showTab = false;
          break;
        case "TRON":
          this.currentChain = "TRON";
          break;
        default:
          this.currentChain = "BHP";
          // this.showTab = true;
          break;
      }

      for (let obj of JSON.parse(sessionStorage.getItem("bhpWalletList"))) {
        if (this.currentChain == obj.chainName) {
          this.tableData = obj.accounts;
          break;
        }
      }
    },
    saveNewAccount(isLead) {
      if (
        this.bhpWalletObj.accounts ||
        this.filWalletObj.accounts ||
        this.tronAccountObj.accounts
      ) {
        let bhpWalletList = JSON.parse(sessionStorage.getItem("bhpWalletList"));
        let catchData = [];
        let needAdd = true;
        for (let obj of bhpWalletList) {
          if (obj.chainName == "BHP" && this.currentChain == "BHP") {
            if (
              obj.accounts.every(
                (v) => v.address != this.bhpWalletObj.accounts[0].address
              )
            ) {
              obj.accounts.push(this.bhpWalletObj.accounts[0]);
              catchData.push(this.bhpWalletObj.accounts[0]);
              needAdd = false;
              break;
            } else {
              this.$refs.myMsg.openMessage("error", this.$t("amAlreadyExists"));
              needAdd = false;
              return;
            }
          } else if (obj.chainName == "FIL" && this.currentChain == "FIL") {
            if (
              obj.accounts.every(
                (v) => v.address != this.filWalletObj.accounts[0].address
              )
            ) {
              obj.accounts.push(this.filWalletObj.accounts[0]);
              catchData.push(this.filWalletObj.accounts[0]);
              needAdd = false;
              break;
            } else {
              this.$refs.myMsg.openMessage("error", this.$t("amAlreadyExists"));
              needAdd = false;
              return;
            }
          } else if (obj.chainName == "TRON" && this.currentChain == "TRON") {
            if (
              obj.accounts.every(
                (v) => v.address != this.tronAccountObj.accounts[0].address
              )
            ) {
              obj.accounts.push(this.tronAccountObj.accounts[0]);
              catchData.push(this.tronAccountObj.accounts[0]);
              needAdd = false;
              break;
            } else {
              this.$refs.myMsg.openMessage("error", this.$t("amAlreadyExists"));
              needAdd = false;
              return;
            }
          }
        }

        if (needAdd) {
          switch (this.currentChain) {
            case "BHP":
              bhpWalletList.push(this.bhpWalletObj);
              catchData.push(this.bhpWalletObj.accounts[0]);
              break;
            case "FIL":
              bhpWalletList.push(this.filWalletObj);
              catchData.push(this.filWalletObj.accounts[0]);
              break;
            case "TRON":
              bhpWalletList.push(this.tronAccountObj);
              catchData.push(this.tronAccountObj.accounts[0]);
              break;
          }
        }

        let json = JSON.stringify(bhpWalletList);
        fs.writeFile(this.filePath, json, (err) => {
          if (err) {
            this.$refs.myMsg.openMessage("error", err);
          } else {
            this.tableData = this.tableData.concat(catchData);

            sessionStorage.setItem(
              "bhpWalletList",
              JSON.stringify(bhpWalletList)
            );
            if (isLead) {
              this.$refs.myMsg.openMessage(
                "success",
                this.$t("amImportSuccess")
              );
            } else {
              this.$refs.myMsg.openMessage(
                "success",
                this.$t("amCreateSuccess")
              );
            }
          }
        });
      }
    },
    createAccount() {
      this.showCreate = true;
    },
    createAccountCancel() {
      this.createAddrLabel = "";
      this.password = "";
      this.showCreate = false;
    },
    async createAccountOk() {
      let that = this;
      try {
        Utils.decryptContent(
          that.passData[that.passData.length - 1].privateKey,
          that.password
        );

        let mnemonic = createMnemonic();
        if (this.currentChain == "BHP") {
          bhpCreateWallet(that, mnemonic);
        } else if (this.currentChain == "FIL") {
          await filCreateWallet(that, mnemonic);
        } else if (this.currentChain == "TRON") {
          await tronCreateAccount(that);
        }
        that.saveNewAccount(false);
      } catch (err) {
        window.logger.verbose("Account Management: create account - ");
        window.logger.error(err);
        that.password = "";
        if (err.toString().indexOf("wrong password") != -1) {
          that.$refs.myMsg.openMessage("error", that.$t("comPasswordError"));
        } else {
          that.$refs.myMsg.openMessage("error", that.$t("amCreateFailed"));
        }
      }
      that.createAccountCancel();
    },
    importMnemonic() {
      this.showImport1 = true;
    },
    async importMnemonicOk() {
      let that = this;
      let flog = true;
      try {
        Utils.decryptContent(
          that.passData[that.passData.length - 1].privateKey,
          that.password
        );
      } catch (err) {
        window.logger.verbose("Account Management: import mnemonic - ");
        window.logger.error(err);
        if (err) {
          flog = false;
          that.password = "";
          that.newPriKey = "";
          that.$refs.myMsg.openMessage("error", that.$t("comPasswordError"));
        }
      }
      if (flog) {
        // if (this.currentChain == "BHP") {
        //   bhpLeadPriKey(that, that.newPriKey);
        // } else if (this.currentChain == "FIL") {
        // await filLeadMnemonic(this,that.newPriKey)
        // }
        that.saveNewAccount(true);
      }

      that.importMnemonicCancel();
    },
    importMnemonicCancel() {
      this.newPriKey = "";
      this.newAddrLabel = "";
      this.password = "";
      this.showImport1 = false;
    },
    importPriKey() {
      this.showImport = true;
    },
    importPriKeyCancel() {
      this.newPriKey = "";
      this.newAddrLabel = "";
      this.password = "";
      this.showImport = false;
    },
    importPriKeyOk() {
      let that = this;
      let flog = true;
      try {
        Utils.decryptContent(
          that.passData[that.passData.length - 1].privateKey,
          that.password
        );
      } catch (err) {
        window.logger.verbose("Account Management: import private key - ");
        window.logger.error(err);

        if (err) {
          flog = false;
          that.password = "";
          that.newPriKey = "";
          that.newAddrLabel = "";
          that.$refs.myMsg.openMessage("error", that.$t("comPasswordError"));
        }
      }
      if (flog) {
        if (that.currentChain == "BHP") {
          bhpLeadPriKey(that, that.newPriKey);
        } else if (that.currentChain == "FIL") {
          filLeadPriKey(that, that.newPriKey);
        } else if (that.currentChain == "TRON") {
          tronLeadPriKey(that, that.newPriKey);
        }
        that.saveNewAccount(true);
      }

      that.importPriKeyCancel();
    },
    copyAddress(row) {
      this.$clipboard(row.address);
      this.$refs.myMsg.openMessage("success", this.$t("amCopyAddressSuccess"));
    },
    editAddrLabel(row, index) {
      this.editIndex = index;
      this.newLabel = row.name;
      this.showLabel = true;
    },
    editAddrLabelCancel() {
      this.editIndex = "";
      this.newLabel = "";
      this.showLabel = false;
    },
    editAddrLabelOk() {
      // update data
      if (this.newLabel) {
        let bhpWalletList = JSON.parse(sessionStorage.getItem("bhpWalletList"));
        for (let obj of bhpWalletList) {
          if (obj.chainName == this.currentChain) {
            obj.accounts[this.editIndex].name = this.newLabel;
          }
        }
        let json = JSON.stringify(bhpWalletList);

        fs.writeFile(sessionStorage.getItem("filePath"), json, (err) => {
          if (err) {
            this.$refs.myMsg.openMessage("error", err);
          } else {
            this.tableData[this.editIndex].name = this.newLabel;
            sessionStorage.setItem(
              "bhpWalletList",
              JSON.stringify(bhpWalletList)
            );
            this.$refs.myMsg.openMessage("success", this.$t("amUpdateSuccess"));
          }
          this.editAddrLabelCancel();
        });
      } else {
        this.$refs.myMsg.openMessage("error", this.$t("amAddrLabelMsg"));
      }
    },
    viewPriKey(row, index) {
      this.showPriKeyData = row;
      // show 密码框
      this.editIndex = index;
      this.show1 = true;
      this.passFlog = "viewPriKey";
    },
    viewPriKeyCancel() {
      // clear data
      this.showPriKeyData = {};
      this.privateKey = "";
      this.password = "";
      this.showPriKey = false;
      this.show1 = false;
    },
    surePassword() {
      if (this.passFlog == "viewPriKey") {
        //展示私钥密码确认
        let flog = true;
        try {
          this.privateKey = Utils.decryptContent(
            this.tableData[this.editIndex].privateKey,
            this.password
          );
          this.showPriKeyData.privateKey = this.privateKey;
        } catch (err) {
          this.password = "";
          flog = false;
          this.$refs.myMsg.openMessage("error", this.$t("comPasswordError"));
        }
        if (flog) {
          this.showPriKey = true;
        }
      } else if (this.passFlog == "deleteAddr") {
        //删除地址弹框密码确认
        let flog = true;
        try {
          Utils.decryptContent(
            this.tableData[this.editIndex].privateKey,
            this.password
          );
        } catch (err) {
          this.password = "";
          flog = false;
          this.$refs.myMsg.openMessage("error", this.$t("comPasswordError"));
        }
        if (flog) {
          let bhpWalletList = JSON.parse(
            sessionStorage.getItem("bhpWalletList")
          );
          for (let obj of bhpWalletList) {
            if (obj.chainName == this.currentChain) {
              obj.accounts.splice(this.editIndex, 1);
            }
          }

          let isDeleteAll = false;
          //删完了
          if (bhpWalletList.every((v) => v.accounts.length == 0)) {
            sessionStorage.setItem("bhpWalletList", JSON.stringify([]));
            isDeleteAll = true;
          }

          let json = JSON.stringify(bhpWalletList);
          fs.writeFile(sessionStorage.getItem("filePath"), json, (err) => {
            if (err) {
              this.$refs.myMsg.openMessage("error", err);
            } else {
              this.tableData.splice(this.editIndex, 1);
              sessionStorage.setItem(
                "bhpWalletList",
                JSON.stringify(bhpWalletList)
              );
              this.$refs.myMsg.openMessage(
                "success",
                this.$t("comDeleteSuccess")
              );
            }
            this.closePassword();
            if (isDeleteAll) this.$router.push("/");
          });
        }
      }
    },
    closePassword() {
      this.show1 = false;
      this.password = "";
    },
    deleteAddr(row, index) {
      this.editIndex = index;
      let that = this;
      that
        .$confirm(
          that.$t("amDeleteAccountMsg", { deleteAddress: row.address }),
          that.$t("amDeleteAccountMsg2"),
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: that.$t("comOk"),
            cancelButtonText: that.$t("comCancel"),
            cancelButtonClass: "confirm-cancel",
            closeOnClickModal: false,
          }
        )
        .then(() => {
          this.show1 = true;
          this.passFlog = "deleteAddr";
        })
        .catch((err) => {
          if (err != "cancel") {
            window.logger.verbose("Account Management: delete - ");
            window.logger.error(err);
          }
        });
    },
    showPriKey2(val) {
      this.showPriKey = val;
    },
    headerRowClass() {
      return "headerRowCss";
    },
    headerCellClass(row) {
      if (row.columnIndex == 0) {
        return "cellCssFirst";
      } else if (row.columnIndex == 3) {
        return "headerCellCss cellCssLast";
      }
      return "headerCellCss";
    },
    rowClass(row) {
      if (row.rowIndex % 2 == 0) {
        return "rowCss rowEvenCss";
      } else {
        return "rowCss rowOddCss";
      }
    },
    cellClass(row) {
      if (row.columnIndex == 0) {
        return "cellCss cellCssFirst";
      } else if (row.columnIndex == 3) {
        return "cellCss cellCssLast";
      }
      return "cellCss";
    },
  },
};
</script>

<style lang="less">
@import url("../assets/css/comTable");

.accountManage {
  display: flex;
  flex-direction: column;

  .title {
    flex-shrink: 0;
  }

  .top-btn {
    display: flex;
    justify-content: space-between;

    p {
      margin: 0 0 30px;
      font-size: 20px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 400;
      color: #000000;
      line-height: 28px;
    }

    .choose-chain {
      display: inline-block;
      height: 48px;
    }
    .account-opt {
      display: inline-block;

      button {
        width: 130px;
        height: 48px;
        background: none;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #0676ed;
        line-height: 22px;

        img {
          width: 24px;
          height: 20px;
          padding-right: 10px;
          vertical-align: middle;
        }
      }
    }
  }

  .main-container {
    border-radius: 13px 13px 0px 0px;
    box-shadow: rgba(46, 63, 114, 0.13) 0 0 10px;

    .edit-img {
      width: 15px;
      height: 15px;
      padding-left: 5px;
      vertical-align: middle;
      cursor: pointer;
    }

    .table-opt {
      padding: 0;
      background: none;

      img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }
    }

    .table-opt:nth-child(even) {
      padding-left: 11px;
    }
  }
}

.create-dialog,
.import-dialog {
  .el-form-item__label {
    width: 90px;
    font-size: 18px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    letter-spacing: 1px;
    text-align-last: justify;
  }

  .el-form-item__content {
    margin-left: 90px;
  }
}

.encss-dialog-label {
  .el-form-item__label {
    width: 150px;
  }

  .el-form-item__content {
    margin-left: 150px;
  }
}

.import-dialog {
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }

  .prikey-img {
    width: 25px;
    height: 25px;
    padding: 7px 10px 8px 6px;
  }
}

.pri-dialog {
  .dia-row {
    padding-bottom: 12px;
  }
  p {
    margin-top: 0;
  }

  p,
  span {
    display: inline-block;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #747474;
    line-height: 20px;
  }

  .pri-title {
    width: 70px;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 20px;
  }

  .pri-text {
    width: 380px;
    vertical-align: text-top;
  }

  .encss-pri-title {
    width: 110px;
  }

  .encss-pri-text {
    width: 340px;
  }
}

.encss-account {
  width: 230px !important;
}
</style>
