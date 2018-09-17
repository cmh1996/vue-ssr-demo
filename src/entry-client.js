// 仅运行于浏览器
import Vue from 'vue'
import { createApp } from './app'

// 全局混合，在客户端路由发生变化时，预取匹配组件数据
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options

    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  // 客户端，挂载 app 之前，store状态更换
  store.replaceState(window.__INITIAL_STATE__)
}

// App.vue 模板中跟元素具有 `id="app"`
router.onReady(_ => {
  console.log('client entry')

  router.beforeResolve((to, from, next) => {
    const matchedComponents = router.getMatchedComponents(to)
    const prevMatchedComponents = router.getMatchedComponents(from)
    const activated = matchedComponents.filter((component, i) => component !== prevMatchedComponents[i])

    const activatedAsyncHooks = activated.map(component => component && component.asyncData).filter(Boolean)

    if (!activatedAsyncHooks.length) {
      return next()
    }

    // 开始预取 数据
    notify('Prefetch data...')
    Promise.all(activatedAsyncHooks.map(hook => hook({ store, route: to })))
      .then(_ => {
        console.log('ok')
        next()
      })
      .catch(next)
  })

  app.$mount('#app') // 客户端激活
})


function notify(title) {
  if (!('Notification' in window)) {
    return
  } else if (Notification.permission === 'granted') {
    return new Notification(title)
  } else {
    Notification.requestPermission(permission => {
      if (permission === 'granted') {
        return new Notification(title)
      }
    })
  }
}