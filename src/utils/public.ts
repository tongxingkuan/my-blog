const routeNameMap = [
  {
    name: '主页',
    routeName: 'home'
  },
  {
    name: '文章',
    routeName: 'articles'
  },
  {
    name: '案例',
    routeName: 'demos'
  }
];
const getRouteName = (routeName: string) => {
  return routeNameMap.find(item => item.routeName === routeName)?.name || '未找到对应的路径名';
}
export default {
  getRouteName
}