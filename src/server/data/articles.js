const articles = [
  {
    name: '内置对象',
    path: 'articles/object',
    tag: '数组、正则、可迭代对象',
    desc: '由内置对象揭开对象的神秘面纱'
  },
  {
    name: '面向对象',
    path: 'articles/oop',
    tag: '对象、原型、原型链、构造函数、封装、继承',
    desc: '从自己创建一个对象，然后。。。。。。'
  },
  {
    name: 'vue3源码解读',
    path: 'articles/vue3',
    tag: 'vue3、vue、源码',
    desc: '本文将从入口文件到打包配置，浏览器调试等一系列方面展开解读vue3源码'
  },
  {
    name: 'vue2源码流程图',
    path: 'articles/vue2',
    tag: 'vue2、vue、源码',
    desc: 'vue2源码流程图'
  },
  {
    name: 'nuxt/content的应用实践',
    path: 'articles/nuxtcontent',
    tag: 'nuxt、nuxt/content',
    desc: '从我的博客开发实践带领读者走近nuxt/content'
  },
  {
    name: 'vue3项目开发',
    path: 'articles/vue3project',
    tag: 'vue3、vue',
    desc: 'vue3语法介绍'
  },
  {
    name: '浏览器缓存',
    path: 'articles/storage',
    tag: 'cookie、sessionStorage、localStorage',
    desc: '分析cookie、sessionStorage、localStorage的特点，使用场景'
  },
  {
    name: '数据类型',
    path: 'articles/datatype',
    tag: '基本数据类型、引用数据类型',
    desc: '介绍前端js中的数据类型：包括基本数据类型和引用数据类型'
  },
  {
    name: 'x了个x代码解读',
    path: 'articles/xlegex',
    tag: 'vue3、nuxt3',
    desc: '前端代码实现游戏x了个x'
  },
];

const find = (pageSize, pageNum, tag, name) => {
  let keywords = tag || name || '';
  let lowerKeywords = keywords.toLocaleLowerCase();
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1
  if (!size || size < 1) size = 10
  const start = (page - 1) * size;
  if (tag) {
    return articles.filter(item => item.tag.toLocaleLowerCase().indexOf(lowerKeywords) > -1).slice(start, start + size);
  } else {
    return articles.filter(item => item.name.toLocaleLowerCase().indexOf(lowerKeywords) > -1).slice(start, start + size);
  }
}

const getTotal = (tag, name) => {
  let keywords = tag || name || '';
  let lowerKeywords = keywords.toLocaleLowerCase();
  if (tag) {
    return articles.filter(item => item.tag.toLocaleLowerCase().indexOf(lowerKeywords) > -1).length;
  } else {
    return articles.filter(item => item.name.toLocaleLowerCase().indexOf(lowerKeywords) > -1).length;
  }
}


export {
  find,
  getTotal
}