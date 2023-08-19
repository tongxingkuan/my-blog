import { articles } from "../data/articles";

const find = (pageSize, pageNum) => {
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1;
  if (!size || size < 1) size = 10;
  const start = (page - 1) * size;
  return articles.slice(start, start + size);
};

const getTotal = () => {
  return articles.length;
};

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  return {
    articles: find(query.pageSize, query.pageNum),
    total: getTotal(),
  };
});
