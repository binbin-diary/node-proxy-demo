const express = require('express');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 9028; // 端口

// 响应头跨域设置
const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}
app.use(allowCrossDomain);

// proxy 配置
const proxyOptions = { 
  target: 'http://localhost:9001/', 
  changeOrigin: true,
  pathRewrite: {
    '^/api' : ''
  },
}

// proxy api
app.use('/api', createProxyMiddleware(proxyOptions));


// 监听
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})

