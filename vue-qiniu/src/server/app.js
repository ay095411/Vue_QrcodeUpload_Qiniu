// 引入包
const express = require('express')
const bodyparse = require('body-parser')
// 创建服务
const app = express()
// 解析数据
app.use(bodyparse.json())
// 引入七牛云配置
const qnconfig = require('./config.js')

//设置跨域访问
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials','true');
    next();
};
app.use(allowCrossDomain);


/*var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/


// 处理请求
app.get('/token', (req, res, next) => {
  res.status(200).send(qnconfig.uploadToken)
})
// 监听3000端口
app.listen(3000, () => {
  console.log('this server are running on localhost:3000!')
})