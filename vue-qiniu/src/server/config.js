/*
七牛云配置
*/
const qiniu = require('qiniu')

// 创建上传凭证
const accessKey = 'KKtbVVgFargHg8Iwsl_EKkBYcEYLxRKM56O6zDP7'
const secretKey = 'OVB-m9NAmPSMREN3LNUEMW3b47UL1KCU3fPXdoQP'
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const options = {
  scope: 'xmcc',
  expires: 7200
}
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

module.exports = {
  uploadToken
}