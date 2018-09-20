// 仅运行于浏览器
import Vue from 'vue'
import { createApp } from './app'
const { app, router, store } = createApp()

// 客户端，挂载 app 之前，store状态更换
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

//只会在第一次打开页面的时候执行一次，激活服务器传过来的html字符串
router.onReady(_ => {
  ///路由跳转前触发，用来执行asyncData()
  router.beforeResolve((to, from, next) => {
    const matchedComponents = router.getMatchedComponents(to);
    const prevMatchedComponents = router.getMatchedComponents(from);
    const activated = matchedComponents.filter((component, i) => component !== prevMatchedComponents[i]);

    //筛选出有asyncData生命周期的组件
    const activatedAsyncHooks = activated.map(component => component && component.asyncData).filter(Boolean);

    if (!activatedAsyncHooks.length) {
      return next();
    }
    // 开始预取数据
    Promise.all(activatedAsyncHooks.map(hook => hook({ store, route: to })))
      .then(_ => {
        next();
      })
      .catch(next)
  });

  app.$mount('#app'); // 客户端激活
})
