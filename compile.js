//编译器
class Compile {
  constructor (el, vm) {

    this.$el = document.querySelector(el)

    this.$vm = vm

    //编译
    if (this.$el) {
      //转换内部内容为片段Fragment
      this.$fragment = this.node2Fragment(this.$el)
      //执行编译
      this.compile(this.$fragment)
      //将编译完成的html填充到容器
      this.$el.appendChild(this.$fragment)
    }
  }

  //转换内部内容为片段Fragment
  node2Fragment (el) {
    const frag = document.createDocumentFragment()
    let child
    while (child = el.firstChild) {
      frag.appendChild(child)
    }
    return frag
  }

  //编译过程
  compile (fragment) {
    const childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {

      if (this.isElement(node)) {
        //元素
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr => {
          const attrName = attr.name
          const attrValue = attr.value
          if (this.isDirective(attrName)) {
            const dir = attrName.substring(2)
            //执行指令
            this[dir] && this[dir](node, this.$vm, attrValue)
          }
          if (this.isEvent(attrName)) {
            const dir = attrName.substring(1)
            this.eventHandler(node, this.$vm, attrValue, dir)
          }
        })

      } else if (this.isText(node)) {
        //文本
        this.compileText(node)
      }

      if (node.childNodes?.length > 0) {
        this.compile(node)
      }
    })
  }

  compileText (node) {

    //node.textContent = this.$vm.$data[RegExp.$1]
    this.update(node, this.$vm, RegExp.$1, 'text')
  }

  update (node, vm, exp, dir) {
    const updateFn = this[dir + 'Updater']
    //初始化
    updateFn && updateFn(node, vm[exp])
    //依赖收集
    new Watcher(vm, exp, function (value) {
      updateFn && updateFn(node, value)
    })
  }

  text (node, vm, exp) {
    this.update(node, vm, exp, 'text')
  }

  textUpdater (node, value) {
    node.textContent = value
  }

  html (node, vm, exp) {
    this.update(node, vm, exp, 'html')
  }

  htmlUpdater (node, value) {
    node.innerHTML = value
  }


  //双绑
  model (node, vm, exp) {

    //指定input的value值
    this.update(node, vm, exp, 'model')
    //视图对模型响应
    node.addEventListener('input', e => {
      vm[exp] = e.target.value
    })
  }

  modelUpdater (node, value) {
    node.value = value
  }

  eventHandler (node, vm, exp, dir) {
    let fn = vm.$options.methods && vm.$options.methods[exp]
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm))
    }
  }


  isDirective (attr) {
    return attr.indexOf('v-') == 0
  }

  isEvent (attr) {
    return attr.indexOf('@') == 0
  }

  isElement (node) {
    return node.nodeType === 1
  }

  //插值文本
  isText (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}
