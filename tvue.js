class TVue {
  constructor (options) {
    this.$options = options
    //数据响应化
    this.$data = options.data
    this.observe(this.$data)

    new Compile('#app', this)
    if (options.created) {
      options.created.call(this)
    }

  }

  observe (value) {
    if (!value || typeof value !== "object") {
      return
    }
    Object.keys(value).forEach(key => {
      this.defineReactive(value, key, value[key])
      //代理data的属性到vue实例上面
      this.proxyData(key)
    })
  }

  defineReactive (obj, key, value) {

    this.observe(value)

    const dep = new Dep()

    Object.defineProperty(obj, key, {
      get () {
        Dep.target && dep.addDep(Dep.target)
        return value
      },
      set (newValue) {
        if (value === newValue) return
        value = newValue
        dep.notify()
      }
    })
  }

  proxyData (key) {
    Object.defineProperty(this, key, {
      get () {
        return this.$data[key]
      },
      set (newValue) {
        this.$data[key] = newValue
      }
    })
  }
}


//依赖收集 Dep用来管理Watcher
class Dep {
  constructor () {
    this.deps = []
  }

  addDep (dep) {
    this.deps.push(dep)
  }

  notify () {
    this.deps.forEach(dep => {
      dep.update()
    })
  }
}


//Watcher
class Watcher {
  constructor (vm, key, cb) {

    this.vm = vm
    this.key = key
    this.cb = cb

    //将当前Watcher的实例指定到Dep静态属性中
    Dep.target = this
    this.vm[this.key] //触发get,添加依赖
    Dep.target = null

  }

  update () {
    //console.log('属性更新了')
    this.cb.call(this.vm, this.vm[this.key])
  }
}
