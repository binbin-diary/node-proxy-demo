const express = require('express');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 9080; // 端口

// proxy 配置
const proxyOptions = { 
  target: 'http://localhost:9080/', 
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

