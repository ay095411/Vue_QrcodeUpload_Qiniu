# -
vue-cli + express 简单实现上传本地图片到七牛云

模拟前后端分离，后端向前端发送七牛云的上传凭证token，前端获得凭证后将图片上传到七牛云，并获得返回的图片url地址

要用到的： 
      1、 空间名称bucket
      2、 SK 和 AK ,在控制面板的密匙管理
      3、 储存空间的外链域名，在储存空间可以找到
      
      
      
创建后端程序app.js

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



创建config.js以用来生成上传凭证

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


server的目录结构

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
    
    
 打开config文件夹下的index.js
添加跨域代理访问

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
    
    
    
 写upload.vue
代码比较简单，基本从element-ui 官网拷贝过来就可以用了
<template>
  <!-- upload -->
  <div class="upload">
    <el-upload
      class="avatar-uploader"
      :action= domain
      :http-request = upqiniu
      :show-file-list="false"
      :before-upload="beforeUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>
<script>
export default {
  data () {
    return {
      imageUrl: '',
      token: {},
      // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
      domain: 'https://upload-z2.qiniup.com',
      // 这是七牛云空间的外链默认域名
      qiniuaddr: 'p3z6q1uw1.bkt.clouddn.com'
    }
  },
  methods: {
    // 上传文件到七牛云
    upqiniu (req) {
      console.log(req)
      const config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      let filetype = ''
      if (req.file.type === 'image/png') {
        filetype = 'png'
      } else {
        filetype = 'jpg'
      }
      // 重命名要上传的文件
      const keyname = 'lytton' + new Date() + Math.floor(Math.random() * 100) + '.' + filetype
      // 从后端获取上传凭证token
      this.axios.get('/up/token').then(res => {
        console.log(res)
        const formdata = new FormData()
        formdata.append('file', req.file)
        formdata.append('token', res.data)
        formdata.append('key', keyname)
        // 获取到凭证之后再将文件上传到七牛云空间
        this.axios.post(this.domain, formdata, config).then(res => {
          this.imageUrl = 'http://' + this.qiniuaddr + '/' + res.data.key
          // console.log(this.imageUrl)
        })
      })
    },
    // 验证文件合法性
    beforeUpload (file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>
<style scoped>
.upload {
  width: 600px;
  margin: 0 auto;
}
.avatar-uploader .el-upload {
  border: 5px dashed #ca1717 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

// over~
