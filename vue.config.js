module.exports = {
    devServer: {
        open: true,
        host: '0.0.0.0',
        port: 8080,
        https: false,
        //以上的ip和端口是我们本机的;下面为需要跨域的
        proxy: { //配置跨域
            '/api': {
                target: 'https://mrpc.bhpnet.io/fil', //这里后台的地址模拟的;应该填写你们真实的后台接口
                ws: true,
                changOrigin: true, //允许跨域
                pathRewrite: {
                    '^/api': '' //请求的时候使用这个api就可以
                }
            }
        }
    },
    publicPath: '', // 相对于 HTML 页面（目录相同）
    productionSourceMap: false,
    //rem
    lintOnSave: true,
    css: {
        loaderOptions: {
            postcss: {
                plugins: [
                    require('postcss-pxtorem')({
                        rootValue: 16, // 换算的基数
                        selectorBlackList: ['weui', 'mu'], // 忽略转换正则匹配项
                        propList: ['*'],
                    }),
                ]
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                // 在这里的配置将会和默认配置合并，然后传递给electron-builder
                appId: 'bhpgui.bhpnet.io', // 项目唯一标识
                productName: 'BHP-GUI', // 打包产物的前缀
                copyright: 'Copyright © year ${author}', // 可用使用${}引用package.json里面配置项，配置项不存在会报错
                // directories: {
                //     output: 'dist' // 打包产物的位置
                // }
                // electronDownload: {
                //     "mirror": "https://npm.taobao.org/mirrors/electron/"
                // },
                asar: false, // asar打包 
                extraResources: { // 拷贝dll等静态文件到指定位置
                    from: "./node_modules/electron-log",
                    to: "./app/node_modules/electron-log"
                },
                // ------- windows 相关配置
                win: {
                    icon: './public/logo.png', // 应用图标
                    // publish: [
                    //     {
                    //         provider: "generic",
                    //         url: "http://192.168.0.90:8089/E%3A/new" //更新服务器地址,可为空
                    //     }
                    // ]
                },
                nsis: {
                    oneClick: false,//创建一键安装程序还是辅助安装程序
                    perMachine: true,//是否显示辅助安装程序的安装模式安装程序页面（选择按机器还是按用户）。或者是否始终按所有用户（每台计算机）安装。
                    createDesktopShortcut: true,//是否创建桌面快捷方式。设置为always是否在重新安装时也重新创​​建（即使被用户删除）。
                    createStartMenuShortcut: true,//是否创建开始菜单快捷方式。
                    allowToChangeInstallationDirectory: true // 仅辅助安装程序。是否允许用户更改安装目录。
                }
                // ------- Mac 相关配置
                // mac: {
                //     icon: 'build/icons/icon.icns', // 应用图标
                //     category: 'public.app-category.utilities', // 应用类型
                //     target: ['dmg'] // 打包的目标类型(默认是dmg和zip),支持很多类型，具体看文档
                // }
                // ------- linux 相关配置
                // linux: {
                //     icon: "build/icons", // 包含各种尺寸图标的文件夹
                //     target: [
                //         "AppImage",
                //         "deb",
                //         "rpm"
                //     ],
                //     category: "Utility",
                // }
            }
        }
    }
}