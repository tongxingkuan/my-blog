import { find, getTotal } from '../data/demos'
export default defineEventHandler(async (event) => {
    const query = await getQuery(event);
    console.log('/api/demos', query);
    return {
        demos: find(query.pageSize, query.pageNum, query.tags),
        total: getTotal(query.tags)
    }
})