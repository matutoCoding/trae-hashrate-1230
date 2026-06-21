export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/members/index',
    'pages/alerts/index',
    'pages/handover/index',
    'pages/audit-log/index',
    'pages/folder-detail/index',
    'pages/member-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E5EBE',
    navigationBarTitleText: '课题组权限审计',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E5EBE',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/members/index',
        text: '成员管理'
      },
      {
        pagePath: 'pages/alerts/index',
        text: '风险预警'
      },
      {
        pagePath: 'pages/handover/index',
        text: '交接清单'
      }
    ]
  }
})
