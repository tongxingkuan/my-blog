import { articles } from "../data/articles";

const find = (pageSize, pageNum, tag, name) => {
  let keywords = tag || name || "";
  let lowerKeywords = keywords.toLocaleLowerCase();
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1;
  if (!size || size < 1) size = 10;
  const start = (page - 1) * size;
  if (tag) {
    return articles
      .filter(
        (item) => item.tag.toLocaleLowerCase().indexOf(lowerKeywords) > -1
      )
      .slice(start, start + size);
  } else {
    return articles
      .filter(
        (item) => item.name.toLocaleLowerCase().indexOf(lowerKeywords) > -1
      )
      .slice(start, start + size);
  }
};

const getTotal = (tag, name) => {
  let keywords = tag || name || "";
  let lowerKeywords = keywords.toLocaleLowerCase();
  if (tag) {
    return articles.filter(
      (item) => item.tag.toLocaleLowerCase().indexOf(lowerKeywords) > -1
    ).length;
  } else {
    return articles.filter(
      (item) => item.name.toLocaleLowerCase().indexOf(lowerKeywords) > -1
    ).length;
  }
};

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  return {
    articles: find(query.pageSize, query.pageNum, query.tag, query.name),
    total: getTotal(query.tag, query.name),
  };
});
