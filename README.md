# -
#  #vue-cli + express 简单实现上传本地图片到七牛云


> 模拟前后端分离，后端向前端发送七牛云的上传凭证token，前端获得凭证后将图片上传到七牛云，并获得返回的图片url地址

#要用到的： 
      1、 空间名称bucket
      2、 SK 和 AK ,在控制面板的密匙管理
      3、 储存空间的外链域名，在储存空间可以找到
      
      
      
#创建后端程序app.js

    // 引入包
    const express = require('express')
    const bodyparse = require('body-parser')
    // 创建服务
    const app = express()
    // 解析数据
    app.use(bodyparse.json())
    // 引入七牛云配置
    const qnconfig = require('./config.js')
    // 处理请求
    app.get('/token', (req, res, next) => {
      // console.log(qnconfig.uploadToken)
      res.status(200).send(qnconfig.uploadToken)
    })
    // 监听3000端口
    app.listen(3000, () => {
      console.log('this server are running on localhost:3000!')
    })



#创建config.js以用来生成上传凭证

    这里就需要用到上面的bucket ,AK,SK
    /*
    七牛云配置
    */
    const qiniu = require('qiniu')
    
    // 创建上传凭证
    const accessKey = 'YOXpF0XvM_3yVDsz5C-hWwrFE5rtDAUQC3XjBQEG'
    const secretKey = 'CmrhUV2xHf1d8nPCsws9wwm7jKypCPA0lRVm-7lS'
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const options = {
      scope: 'lytton',
      expires: 7200
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
    
    module.exports = {
      uploadToken
    }


#server的目录结构

    lytton@lytton-ubuntu:~/桌面/demo/qiniuupload/src/server$ tree -L 1
    .
    ├── app.js
    ├── config.js
    ├── node_modules
    └── package.json
    
    然后控制台 nodemon app.js，当然如果没装nodemon的话，就 node app.js 一样的
    打开浏览器 localhost:3000
    
    
    写前端代码
    首先在根目录安装element-ui axios
    然后在main.js里面引入
    
    然后在client文件夹下面创建一个upload.vue
    并在router里面引入
    
    import Vue from 'vue'
    import Router from 'vue-router'
    import UpLoad from '@/client/upload'
    
    Vue.use(Router)
    
    export default new Router({
      routes: [
    {
      path: '/',
      component: UpLoad
    }
      ]
    })
    
    ├── App.vue
    ├── client
    │   └── upload.vue
    ├── main.js
    ├── router
    │   └── index.js
    └── server
    ├── app.js
    ├── config.js
    ├── node_modules
    └── package.json
    
    
#打开config文件夹下的index.js 添加跨域代理访问

    module.exports = {
      dev: {
    
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/up': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/up': '/'
    }
      }
    },
    
    
    
#写upload.vue 代码比较简单，从element-ui官网拷贝过来就可以用了
    <TEMPLATE>
      <!-- UPLOAD -->
      <DIV CLASS="UPLOAD">
    <EL-UPLOAD
      CLASS="AVATAR-UPLOADER"
      :ACTION= DOMAIN
      :HTTP-REQUEST = UPQINIU
      :SHOW-FILE-LIST="FALSE"
      :BEFORE-UPLOAD="BEFOREUPLOAD">
      <IMG V-IF="IMAGEURL" :SRC="IMAGEURL" CLASS="AVATAR">
      <I V-ELSE CLASS="EL-ICON-PLUS AVATAR-UPLOADER-ICON"></I>
    </EL-UPLOAD>
      </DIV>
    </TEMPLATE>
    <SCRIPT>
    EXPORT DEFAULT {
      DATA () {
    RETURN {
      IMAGEURL: '',
      TOKEN: {},
      // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
      DOMAIN: 'HTTPS://UPLOAD-Z2.QINIUP.COM',
      // 这是七牛云空间的外链默认域名
      QINIUADDR: 'P3Z6Q1UW1.BKT.CLOUDDN.COM'
    }
      },
      METHODS: {
    // 上传文件到七牛云
    UPQINIU (REQ) {
      CONSOLE.LOG(REQ)
      CONST CONFIG = {
    HEADERS: {'CONTENT-TYPE': 'MULTIPART/FORM-DATA'}
      }
      LET FILETYPE = ''
      IF (REQ.FILE.TYPE === 'IMAGE/PNG') {
    FILETYPE = 'PNG'
      } ELSE {
    FILETYPE = 'JPG'
      }
      // 重命名要上传的文件
      CONST KEYNAME = 'LYTTON' + NEW DATE() + MATH.FLOOR(MATH.RANDOM() * 100) + '.' + FILETYPE
      // 从后端获取上传凭证TOKEN
      THIS.AXIOS.GET('/UP/TOKEN').THEN(RES => {
    CONSOLE.LOG(RES)
    CONST FORMDATA = NEW FORMDATA()
    FORMDATA.APPEND('FILE', REQ.FILE)
    FORMDATA.APPEND('TOKEN', RES.DATA)
    FORMDATA.APPEND('KEY', KEYNAME)
    // 获取到凭证之后再将文件上传到七牛云空间
    THIS.AXIOS.POST(THIS.DOMAIN, FORMDATA, CONFIG).THEN(RES => {
      THIS.IMAGEURL = 'HTTP://' + THIS.QINIUADDR + '/' + RES.DATA.KEY
      // CONSOLE.LOG(THIS.IMAGEURL)
    })
      })
    },
    // 验证文件合法性
    BEFOREUPLOAD (FILE) {
      CONST ISJPG = FILE.TYPE === 'IMAGE/JPEG' || FILE.TYPE === 'IMAGE/PNG'
      CONST ISLT2M = FILE.SIZE / 1024 / 1024 < 2
      IF (!ISJPG) {
    THIS.$MESSAGE.ERROR('上传头像图片只能是 JPG 格式!')
      }
      IF (!ISLT2M) {
    THIS.$MESSAGE.ERROR('上传头像图片大小不能超过 2MB!')
      }
      RETURN ISJPG && ISLT2M
    }
      }
    }
    </SCRIPT>
    <STYLE SCOPED>
    .UPLOAD {
      WIDTH: 600PX;
      MARGIN: 0 AUTO;
    }
    .AVATAR-UPLOADER .EL-UPLOAD {
      BORDER: 5PX DASHED #CA1717 !IMPORTANT;
      BORDER-RADIUS: 6PX;
      CURSOR: POINTER;
      POSITION: RELATIVE;
      OVERFLOW: HIDDEN;
    }
    .AVATAR-UPLOADER .EL-UPLOAD:HOVER {
      BORDER-COLOR: #409EFF;
    }
    .AVATAR-UPLOADER-ICON {
      FONT-SIZE: 28PX;
      COLOR: #8C939D;
      WIDTH: 178PX;
      HEIGHT: 178PX;
      LINE-HEIGHT: 178PX;
      TEXT-ALIGN: CENTER;
    }
    .AVATAR {
      WIDTH: 178PX;
      HEIGHT: 178PX;
      DISPLAY: BLOCK;
    }
    </STYLE>

##  ## over~