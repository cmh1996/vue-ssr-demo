const Koa = require('koa');
const fs = require('fs');
const path = require("path");
const koaStatic = require("koa-static");
const KoaRouter = require('koa-router');
const { createBundleRenderer } = require('vue-server-renderer');

const isProd = (process.env.NODE_ENV === 'production');
const resolve = filePath => path.resolve(__dirname, filePath);
const templatePath = resolve('./src/index.template.html');

const app = new Koa();
const router = new KoaRouter();

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

const render = async ctx => {
  ctx.res.setHeader("Content-Type", "text/html");

  const context = {
    title: 'Vue-SSR',
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

router.get('*', render);

app.use(koaStatic(resolve("./dist")));
app.use(router.routes())

const port = parseInt(process.argv[2]) || 8080 // 可以通过 npm run dev 9090 形式指定端口号
app.listen(port, err => {
  if (err) {
    throw err
  }

  console.log(`Server is running at http://localhost:${port}`)
})
