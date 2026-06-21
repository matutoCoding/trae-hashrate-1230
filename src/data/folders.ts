import type { Folder } from '@/types';

export const folders: Folder[] = [
  {
    id: 'f001',
    name: '2024届毕业论文集',
    category: 'paper',
    path: '/论文资料/2024届毕业论文',
    description: '2024届研究生毕业论文初稿、修改稿、终稿及答辩相关材料',
    isSensitive: false,
    fileCount: 48,
    size: '2.3GB',
    updatedAt: '2024-06-15',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2023-09-01', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'edit', grantedAt: '2023-09-01', grantedBy: '张教授' },
      { memberId: 'm005', memberName: '陈浩然', memberStatus: 'graduated', permission: 'edit', grantedAt: '2023-09-01', grantedBy: '张教授' },
      { memberId: 'm009', memberName: '孙伟', memberStatus: 'studying', permission: 'read', grantedAt: '2023-10-15', grantedBy: '张教授' },
      { memberId: 'm010', memberName: '林晓彤', memberStatus: 'studying', permission: 'read', grantedAt: '2023-10-15', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f002',
    name: '深度学习实验原始数据',
    category: 'experiment',
    path: '/实验数据/深度学习实验',
    description: '包含模型训练、测试的原始数据、日志文件和中间结果',
    isSensitive: false,
    fileCount: 156,
    size: '15.8GB',
    updatedAt: '2024-06-18',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2022-03-01', grantedBy: '系统' },
      { memberId: 'm003', memberName: '王小明', memberStatus: 'studying', permission: 'edit', grantedAt: '2022-09-01', grantedBy: '张教授' },
      { memberId: 'm004', memberName: '刘思琪', memberStatus: 'studying', permission: 'edit', grantedAt: '2023-09-01', grantedBy: '张教授' },
      { memberId: 'm006', memberName: '赵雨晴', memberStatus: 'graduated', permission: 'edit', grantedAt: '2021-09-01', grantedBy: '张教授' },
      { memberId: 'm007', memberName: '黄博士', memberStatus: 'external', permission: 'read', grantedAt: '2023-02-20', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f003',
    name: '国家自然科学基金项目经费',
    category: 'fund',
    path: '/经费材料/国家自然科学基金',
    description: '基金申请书、预算表、报销凭证、年度报告等经费相关材料',
    isSensitive: true,
    fileCount: 89,
    size: '1.2GB',
    updatedAt: '2024-05-20',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2022-01-10', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'edit', grantedAt: '2022-01-10', grantedBy: '张教授' },
      { memberId: 'm008', memberName: '周研究员', memberStatus: 'collaboration_ended', permission: 'read', grantedAt: '2022-03-15', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f004',
    name: '研究生毕业交接材料',
    category: 'graduation',
    path: '/毕业交接/研究生材料',
    description: '历届研究生毕业时提交的代码、数据、文档等交接材料',
    isSensitive: false,
    fileCount: 234,
    size: '8.5GB',
    updatedAt: '2024-06-10',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2020-06-01', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'edit', grantedAt: '2020-06-01', grantedBy: '张教授' },
      { memberId: 'm003', memberName: '王小明', memberStatus: 'studying', permission: 'read', grantedAt: '2022-09-01', grantedBy: '张教授' },
      { memberId: 'm004', memberName: '刘思琪', memberStatus: 'studying', permission: 'read', grantedAt: '2023-09-01', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f005',
    name: '伦理审批材料',
    category: 'fund',
    path: '/经费材料/伦理审批',
    description: '涉及人体实验的伦理审查申请表、知情同意书、审查意见等',
    isSensitive: true,
    fileCount: 32,
    size: '500MB',
    updatedAt: '2024-03-15',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2023-05-10', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'read', grantedAt: '2023-05-10', grantedBy: '张教授' },
      { memberId: 'm009', memberName: '孙伟', memberStatus: 'studying', permission: 'read', grantedAt: '2023-06-01', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f006',
    name: '实验室安全培训资料',
    category: 'experiment',
    path: '/实验数据/安全培训',
    description: '实验室安全操作规程、培训课件、考核试卷等',
    isSensitive: false,
    fileCount: 28,
    size: '350MB',
    updatedAt: '2024-04-01',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2021-09-01', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'edit', grantedAt: '2021-09-01', grantedBy: '张教授' },
      { memberId: 'm003', memberName: '王小明', memberStatus: 'studying', permission: 'read', grantedAt: '2022-09-01', grantedBy: '张教授' },
      { memberId: 'm004', memberName: '刘思琪', memberStatus: 'studying', permission: 'read', grantedAt: '2023-09-01', grantedBy: '张教授' },
      { memberId: 'm009', memberName: '孙伟', memberStatus: 'studying', permission: 'read', grantedAt: '2021-09-01', grantedBy: '张教授' },
      { memberId: 'm010', memberName: '林晓彤', memberStatus: 'studying', permission: 'read', grantedAt: '2022-09-01', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f007',
    name: '横向项目合同档案',
    category: 'fund',
    path: '/经费材料/横向合同',
    description: '与企业合作的横向项目合同、协议、保密协议等',
    isSensitive: true,
    fileCount: 15,
    size: '200MB',
    updatedAt: '2024-02-28',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2022-08-15', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'read', grantedAt: '2022-08-15', grantedBy: '张教授' },
      { memberId: 'm008', memberName: '周研究员', memberStatus: 'collaboration_ended', permission: 'edit', grantedAt: '2022-09-01', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f008',
    name: 'SCI期刊论文投稿',
    category: 'paper',
    path: '/论文资料/SCI投稿',
    description: 'SCI期刊论文的投稿版本、审稿意见、回复信、最终录用版',
    isSensitive: false,
    fileCount: 67,
    size: '1.8GB',
    updatedAt: '2024-06-12',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2022-01-01', grantedBy: '系统' },
      { memberId: 'm003', memberName: '王小明', memberStatus: 'studying', permission: 'edit', grantedAt: '2022-09-01', grantedBy: '张教授' },
      { memberId: 'm005', memberName: '陈浩然', memberStatus: 'graduated', permission: 'read', grantedAt: '2022-03-01', grantedBy: '张教授' },
      { memberId: 'm006', memberName: '赵雨晴', memberStatus: 'graduated', permission: 'edit', grantedAt: '2021-09-01', grantedBy: '张教授' },
      { memberId: 'm007', memberName: '黄博士', memberStatus: 'external', permission: 'read', grantedAt: '2023-03-10', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f009',
    name: '学生竞赛项目资料',
    category: 'paper',
    path: '/论文资料/竞赛项目',
    description: '学生参加各类科技竞赛的项目文档、代码、演示材料等',
    isSensitive: false,
    fileCount: 45,
    size: '800MB',
    updatedAt: '2024-05-30',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2020-09-01', grantedBy: '系统' },
      { memberId: 'm004', memberName: '刘思琪', memberStatus: 'studying', permission: 'edit', grantedAt: '2023-09-01', grantedBy: '张教授' },
      { memberId: 'm010', memberName: '林晓彤', memberStatus: 'studying', permission: 'edit', grantedAt: '2022-09-01', grantedBy: '张教授' }
    ]
  },
  {
    id: 'f010',
    name: '仪器设备使用记录',
    category: 'experiment',
    path: '/实验数据/仪器记录',
    description: '实验室大型仪器设备的使用登记、维护保养、校准记录',
    isSensitive: false,
    fileCount: 78,
    size: '150MB',
    updatedAt: '2024-06-20',
    permissions: [
      { memberId: 'm001', memberName: '张教授', memberStatus: 'studying', permission: 'admin', grantedAt: '2020-09-01', grantedBy: '系统' },
      { memberId: 'm002', memberName: '李秘书', memberStatus: 'studying', permission: 'edit', grantedAt: '2020-09-01', grantedBy: '张教授' },
      { memberId: 'm003', memberName: '王小明', memberStatus: 'studying', permission: 'edit', grantedAt: '2022-09-01', grantedBy: '张教授' },
      { memberId: 'm009', memberName: '孙伟', memberStatus: 'studying', permission: 'edit', grantedAt: '2021-09-01', grantedBy: '张教授' }
    ]
  }
];

export const getFolderById = (id: string): Folder | undefined => {
  return folders.find(f => f.id === id);
};

export const getFoldersByCategory = (category: string): Folder[] => {
  return folders.filter(f => f.category === category);
};
