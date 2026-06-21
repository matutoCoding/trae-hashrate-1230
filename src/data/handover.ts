import type { HandoverItem } from '@/types';

export const handoverItems: HandoverItem[] = [
  {
    id: 'h001',
    type: 'revoke',
    title: '收回陈浩然的编辑权限',
    description: '陈浩然已毕业，需收回"2024届毕业论文集"的编辑权限',
    folderId: 'f001',
    folderName: '2024届毕业论文集',
    memberId: 'm005',
    memberName: '陈浩然',
    status: 'pending',
    dueDate: '2024-06-30'
  },
  {
    id: 'h002',
    type: 'revoke',
    title: '收回赵雨晴的编辑权限',
    description: '赵雨晴已毕业，需收回"深度学习实验原始数据"的编辑权限',
    folderId: 'f002',
    folderName: '深度学习实验原始数据',
    memberId: 'm006',
    memberName: '赵雨晴',
    status: 'pending',
    dueDate: '2024-06-30'
  },
  {
    id: 'h003',
    type: 'revoke',
    title: '收回赵雨晴的编辑权限',
    description: '赵雨晴已毕业，需收回"SCI期刊论文投稿"的编辑权限',
    folderId: 'f008',
    folderName: 'SCI期刊论文投稿',
    memberId: 'm006',
    memberName: '赵雨晴',
    status: 'pending',
    dueDate: '2024-06-30'
  },
  {
    id: 'h004',
    type: 'revoke',
    title: '收回周研究员的编辑权限',
    description: '周研究员合作已结束，需收回"横向项目合同档案"的编辑权限',
    folderId: 'f007',
    folderName: '横向项目合同档案',
    memberId: 'm008',
    memberName: '周研究员',
    status: 'pending',
    dueDate: '2024-06-30'
  },
  {
    id: 'h005',
    type: 'supervisor_confirm',
    title: '确认敏感目录共享范围',
    description: '"国家自然科学基金项目经费"的共享范围需要张教授确认',
    folderId: 'f003',
    folderName: '国家自然科学基金项目经费',
    status: 'pending',
    dueDate: '2024-06-30',
    notes: '当前共享人员：张教授、李秘书、周研究员'
  },
  {
    id: 'h006',
    type: 'supervisor_confirm',
    title: '确认敏感目录共享范围',
    description: '"伦理审批材料"的共享范围需要张教授确认',
    folderId: 'f005',
    folderName: '伦理审批材料',
    status: 'pending',
    dueDate: '2024-06-30',
    notes: '当前共享人员：张教授、李秘书、孙伟'
  },
  {
    id: 'h007',
    type: 'supervisor_confirm',
    title: '确认敏感目录共享范围',
    description: '"横向项目合同档案"的共享范围需要张教授确认',
    folderId: 'f007',
    folderName: '横向项目合同档案',
    status: 'pending',
    dueDate: '2024-06-30',
    notes: '当前共享人员：张教授、李秘书、周研究员'
  },
  {
    id: 'h008',
    type: 'transfer',
    title: '移交陈浩然的论文资料',
    description: '陈浩然的毕业论文相关资料需移交给王小明',
    folderId: 'f001',
    folderName: '2024届毕业论文集',
    memberId: 'm005',
    memberName: '陈浩然',
    status: 'confirmed',
    dueDate: '2024-06-25',
    notes: '移交给王小明（m003）'
  },
  {
    id: 'h009',
    type: 'transfer',
    title: '移交赵雨晴的实验数据',
    description: '赵雨晴的深度学习实验数据需移交给刘思琪',
    folderId: 'f002',
    folderName: '深度学习实验原始数据',
    memberId: 'm006',
    memberName: '赵雨晴',
    status: 'confirmed',
    dueDate: '2024-06-25',
    notes: '移交给刘思琪（m004）'
  },
  {
    id: 'h010',
    type: 'revoke',
    title: '评估周研究员的读取权限',
    description: '周研究员合作已结束，评估是否需要收回"国家自然科学基金项目经费"的读取权限',
    folderId: 'f003',
    folderName: '国家自然科学基金项目经费',
    memberId: 'm008',
    memberName: '周研究员',
    status: 'pending',
    dueDate: '2024-06-30',
    notes: '目前只有读取权限，可根据实际情况决定是否收回'
  },
  {
    id: 'h011',
    type: 'transfer',
    title: '移交赵雨晴的论文投稿资料',
    description: '赵雨晴的SCI论文投稿资料需移交给林晓彤',
    folderId: 'f008',
    folderName: 'SCI期刊论文投稿',
    memberId: 'm006',
    memberName: '赵雨晴',
    status: 'pending',
    dueDate: '2024-06-30',
    notes: '移交给林晓彤（m010）'
  },
  {
    id: 'h012',
    type: 'completed',
    title: '完成陈浩然账号清理',
    description: '陈浩然的所有权限已全部处理完毕',
    memberId: 'm005',
    memberName: '陈浩然',
    status: 'completed',
    dueDate: '2024-06-20'
  }
];

export const getHandoverItemById = (id: string): HandoverItem | undefined => {
  return handoverItems.find(h => h.id === id);
};

export const getHandoverStats = () => {
  return {
    total: handoverItems.length,
    pending: handoverItems.filter(h => h.status === 'pending').length,
    confirmed: handoverItems.filter(h => h.status === 'confirmed').length,
    completed: handoverItems.filter(h => h.status === 'completed').length,
    transfer: handoverItems.filter(h => h.type === 'transfer').length,
    revoke: handoverItems.filter(h => h.type === 'revoke').length,
    supervisorConfirm: handoverItems.filter(h => h.type === 'supervisor_confirm').length
  };
};

export const generateHandoverReport = () => {
  const transferItems = handoverItems.filter(h => h.type === 'transfer');
  const revokeItems = handoverItems.filter(h => h.type === 'revoke');
  const confirmItems = handoverItems.filter(h => h.type === 'supervisor_confirm');

  return {
    semester: '2024年春季学期',
    generatedAt: '2024-06-22',
    summary: {
      total: handoverItems.length,
      transfer: transferItems.length,
      revoke: revokeItems.length,
      supervisorConfirm: confirmItems.length,
      completed: handoverItems.filter(h => h.status === 'completed').length,
      inProgress: handoverItems.filter(h => h.status !== 'completed').length
    },
    items: handoverItems
  };
};
