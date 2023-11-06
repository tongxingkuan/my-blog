import { questions } from "../data/questions";

const find = (pageSize, pageNum) => {
  let page = parseInt(pageNum);
  let size = parseInt(pageSize);
  if (!page || page < 1) page = 1;
  if (!size || size < 1) size = 10;
  const start = (page - 1) * size;
  return questions.slice(start, start + size);
};

const getTotal = () => {
  return questions.length;
};

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  return {
    questions: find(query.pageSize, query.pageNum),
    total: getTotal(),
  };
});
2