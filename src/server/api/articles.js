import { find, getTotal } from '../data/articles'
export default defineEventHandler(async (event) => {
    const query = await getQuery(event);
    console.log('/api/articles', query);
    return {
        articles: find(query.pageSize, query.pageNum, query.tag, query.name),
        total: getTotal(query.tag, query.name)
    }
})