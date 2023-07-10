const articles = [
  {
    name: 'vue3源码解读',
    path: 'articles/vue3',
    tag: 'vue、源码',
    desc: '本文将从入口文件到打包配置，浏览器调试等一系列方面展开解读vue3源码'
  },
  {
    name: '文章2',
    path: 'articles/test',
    tag: '文章2',
    desc: 'desc'
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