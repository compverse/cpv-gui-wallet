import Vue from 'vue';
import VueI18n from 'vue-i18n';
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import zhCn from './zh-cn.js';
import enUs from './en-us.js';
import ElementLocale from 'element-ui/lib/locale'

Vue.use(VueI18n);

const messages = {
    'zh-cn': Object.assign(zhCn, zhLocale),
    'en-us': Object.assign(enUs, enLocale)
};

// 设置参数，创建 Vuei18n 的实例。
const i18n = new VueI18n({
    locale: localStorage.getItem("language") || "en-us", // set locale
    messages, // set locale messages
    silentTranslationWarn: true
});

ElementLocale.i18n((key, value) => i18n.t(key, value))

if (!!!localStorage.getItem("language")) { localStorage.setItem("language", "en-us") }

export default i18n