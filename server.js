const Koa = require('koa');
const fs = require('fs');
const path = require("path");
const mime = require('mime');
const mount = require('koa-mount');
const koaStatic = require("koa-static");
const KoaRouter = require('koa-router');
const { createBundleRenderer } = require('vue-server-renderer');

const isProd = (process.env.NODE_ENV === 'production');
const resolve = filePath => path.resolve(__dirname, filePath);
const templatePath = resolve('./src/index.template.html');
const port = parseInt(process.argv[2]) || 8080; 

//获取资源的后缀名，通过mime来获得它对应的mimetype，写入到响应头的content-type里面
//如url是/favicon.ico，后缀名是.ico，mimetype是image/x-icon
const contentType = ()=>{
  return async (ctx, next) => {
    const url = ctx.request.url;
    let ext = url.match(/\.\w+/g);
    ext = (ext && ext.reverse()[0]) || null;
    const mimeType = mime.getType(ext) || 'text/html';
    ctx.set(`Content-Type`, `${mimeType}; charset=utf-8`);
    await next();
  }
}

//设置返回静态资源的路径
//当请求访问/dist前缀的时候，把它交给koa-static处理
const serveStatic = (url, filePath, opts = {})=>{
  return mount(url, koaStatic(filePath, opts))
}

//创建服务端渲染
const createRenderer = (bundle, opts = {}) => {
  return createBundleRenderer(
    bundle,
    Object.assign(opts, {
      basedir: resolve('./dist'),
      template: fs.readFileSync(templatePath, 'utf-8'),
      runInNewContext: false
    })
  )
}



const app = new Koa();
const router = new KoaRouter();

 // 开发环境时，要确认 webpack 已经打包客户端代码和服务端代码
let renderer,readyPromise;
if (isProd) {
  const prodBundle = require('./dist/vue-ssr-server-bundle.json');
  const prodClientManifest = require('./dist/vue-ssr-client-manifest.json');
  // 生成环境直接使用已经生成的 serverBundle 和 clientManifest
  renderer = createRenderer(prodBundle, {
    clientManifest: prodClientManifest
  })
} else {
  readyPromise = require('./build/dev-server')(app, (bundle, opts) => {
    renderer = createRenderer(bundle, opts);
  })
}

//渲染页面，生成html字符串
const render = async ctx => {
  const context = {
    title: 'vue-ssr-demo',
    url: ctx.request.url
  }

  if (isProd) {
    return (ctx.body = await renderer.renderToString(context))
  } else {
    return readyPromise.then(async _ => {
      return (ctx.body = await renderer.renderToString(context))
    })
  }
}


app.use(contentType());
app.use(
  serveStatic('/dist', 'dist', {
    maxAge: isProd ? 365 * 24 * 60 * 60 : 0
  })
);
router.get('*', render);
app.use(router.routes());

// 可以通过 npm run dev 9090 形式指定端口号为9090
app.listen(port, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at http://localhost:${port}`)
})
