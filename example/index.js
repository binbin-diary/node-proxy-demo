const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 9002; // 端口

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
  onProxyRes: async function(proxyRes, req, res) {
    // 截取菜单接口
    if (req.url && req.url === '/access/access-list') {
      let body = {}
      const responseBody = await getBody(proxyRes)
      if (responseBody) {
        body = responseBody;
        generateLocalDirectory(body.data)
      }
    }
  }
}

/**
 * @param {*} proxyRes 
 * @param {*} res 
 */
function getBody(proxyRes) {
  return new Promise((resolve, reject) => {
    let body = []
    proxyRes.on('data', function (chunk) {
      body.push(chunk)
    })
    proxyRes.on('end', function () {
      body = Buffer.concat(body).toString();
      resolve(JSON.parse(body))
    })
  })
}

// 生成本地目录
function generateLocalDirectory(data) {
  for(let i = 0; i < data.length; i++) {
    const item = data[i];
    const { node, type, children } = item;

    // 判断，文件夹是否存在
    const file = filePath(node);
    console.log('file', file)

    if (fs.existsSync(file)) {
      console.log('存在');
    } else {
      // 栏目
      if (type == 1) {
        // 创建目录写入文件
        const template = generateTemplate();
        
        writeFileRecursive(file, template, (err)=>{
          if (err) console.error(err);
          console.info("write success");
        });
      }
    }

    if (children && children.length > 0) {
      generateLocalDirectory(children);
    }

  }
}

/**
 * 读取文件
 * return string
 */
function readFileFn() {
  const filename = resolvePath(__dirname, 'demo.vue');
  try {
    const data = fs.readFileSync(filename, 'utf8')
    return data;
  } catch (err) {
    console.error(err)
  }
}

/**
 * 写入模板内容
 * return string
 */
function generateTemplate() {
  const data = readFileFn();
  return data;
}

/**
 * 创建目录，写入文件
 */
function writeFileRecursive(path, buffer, callback){
  fs.mkdir(path, {recursive: true}, (err) => {
    if (err) return callback(err);
    fs.writeFile(path + '/index.vue', buffer, function(err){
      if (err) return callback(err);
      return callback(null);
    });
  });
}

function filePath(dir) {
  const index = __dirname.indexOf('node');
  const dirname = __dirname.substring(0, index) + 'src/views';
  return resolvePath(dirname, dir)
}

function resolvePath(dirname, dir) {
  return path.join(dirname, dir)
}

// proxy api
app.use('/api', createProxyMiddleware(proxyOptions));

// 监听
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})