import type { Alert } from '@/types';

export const alerts: Alert[] = [
  {
    id: 'a001',
    type: 'graduated_edit',
    title: '已毕业学生仍拥有编辑权限',
    description: '陈浩然（已毕业）仍对"2024届毕业论文集"拥有编辑权限，请及时处理',
    folderId: 'f001',
    folderName: '2024届毕业论文集',
    memberId: 'm005',
    memberName: '陈浩然',
    severity: 'high',
    createdAt: '2024-06-20',
    isResolved: false
  },
  {
    id: 'a002',
    type: 'graduated_edit',
    title: '已毕业学生仍拥有编辑权限',
    description: '赵雨晴（已毕业）仍对"深度学习实验原始数据"拥有编辑权限，请及时处理',
    folderId: 'f002',
    folderName: '深度学习实验原始数据',
    memberId: 'm006',
    memberName: '赵雨晴',
    severity: 'high',
    createdAt: '2024-06-19',
    isResolved: false
  },
  {
    id: 'a003',
    type: 'graduated_edit',
    title: '已毕业学生仍拥有编辑权限',
    description: '赵雨晴（已毕业）仍对"SCI期刊论文投稿"拥有编辑权限，请及时处理',
    folderId: 'f008',
    folderName: 'SCI期刊论文投稿',
    memberId: 'm006',
    memberName: '赵雨晴',
    severity: 'high',
    createdAt: '2024-06-18',
    isResolved: false
  },
  {
    id: 'a004',
    type: 'sensitive_folder',
    title: '敏感目录共享范围需要确认',
    description: '"国家自然科学基金项目经费"包含敏感关键词"经费"，请确认共享范围是否合适',
    folderId: 'f003',
    folderName: '国家自然科学基金项目经费',
    severity: 'medium',
    createdAt: '2024-06-15',
    isResolved: false
  },
  {
    id: 'a005',
    type: 'sensitive_folder',
    title: '敏感目录共享范围需要确认',
    description: '"伦理审批材料"包含敏感关键词"伦理审批"，请确认共享范围是否合适',
    folderId: 'f005',
    folderName: '伦理审批材料',
    severity: 'medium',
    createdAt: '2024-06-14',
    isResolved: false
  },
  {
    id: 'a006',
    type: 'sensitive_folder',
    title: '敏感目录共享范围需要确认',
    description: '"横向项目合同档案"包含敏感关键词"合同"，请确认共享范围是否合适',
    folderId: 'f007',
    folderName: '横向项目合同档案',
    severity: 'high',
    createdAt: '2024-06-12',
    isResolved: false
  },
  {
    id: 'a007',
    type: 'expired_access',
    title: '合作已结束但仍有编辑权限',
    description: '周研究员（合作结束）仍对"横向项目合同档案"拥有编辑权限，请及时处理',
    folderId: 'f007',
    folderName: '横向项目合同档案',
    memberId: 'm008',
    memberName: '周研究员',
    severity: 'high',
    createdAt: '2024-06-10',
    isResolved: false
  },
  {
    id: 'a008',
    type: 'expired_access',
    title: '合作已结束但仍有读取权限',
    description: '周研究员（合作结束）仍对"国家自然科学基金项目经费"拥有读取权限，建议评估是否需要收回',
    folderId: 'f003',
    folderName: '国家自然科学基金项目经费',
    memberId: 'm008',
    memberName: '周研究员',
    severity: 'low',
    createdAt: '2024-06-08',
    isResolved: false
  }
];

export const getAlertById = (id: string): Alert | undefined => {
  return alerts.find(a => a.id === id);
};

export const getActiveAlerts = (): Alert[] => {
  return alerts.filter(a => !a.isResolved);
};

export const getAlertStats = () => {
  const active = alerts.filter(a => !a.isResolved);
  return {
    total: active.length,
    high: active.filter(a => a.severity === 'high').length,
    medium: active.filter(a => a.severity === 'medium').length,
    low: active.filter(a => a.severity === 'low').length
  };
};
