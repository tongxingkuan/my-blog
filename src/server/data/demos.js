const demos = [
  {
    name: 'x了个x',
    path: '/demos/xlegex',
    source: '/img/demos/xlegex.png',
    tags: ['vue3', 'nuxt3']
  },
];

const find = (pageSize, pageNum, tags) => {
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1
  if (!size || size < 1) size = 10
  const start = (page - 1) * size;
  if (tags) {
    tags = JSON.parse(tags)
    return demos.filter(item => tags.every(tag => item.tags.indexOf(tag)> -1)).slice(start, start + size);
  } else {
    return demos.slice(start, start + size);
  }
}

const getTotal = (tags) => {
  if (tags) {
    tags = JSON.parse(tags)
    return demos.filter(item => tags.every(tag => item.tags.indexOf(tag)> -1)).length;
  } else {
    return demos.length;
  }
}


export {
  find,
  getTotal
}