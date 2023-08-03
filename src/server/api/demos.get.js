import { demos } from "../data/demos";

const find = (pageSize, pageNum, tags) => {
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1;
  if (!size || size < 1) size = 10;
  const start = (page - 1) * size;
  if (tags) {
    tags = JSON.parse(tags);
    return demos
      .filter((item) => tags.every((tag) => item.tags.indexOf(tag) > -1))
      .slice(start, start + size);
  } else {
    return demos.slice(start, start + size);
  }
};

const getTotal = (tags) => {
  if (tags) {
    tags = JSON.parse(tags);
    return demos.filter((item) =>
      tags.every((tag) => item.tags.indexOf(tag) > -1)
    ).length;
  } else {
    return demos.length;
  }
};

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  return {
    demos: find(query.pageSize, query.pageNum, query.tags),
    total: getTotal(query.tags),
  };
});
