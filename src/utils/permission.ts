import type { FolderPermission, MemberStatus } from '@/types';

const SENSITIVE_KEYWORDS = ['经费', '合同', '伦理审批', '保密', '专利', '财务', '报销'];

export const isSensitiveFolder = (name: string): boolean => {
  return SENSITIVE_KEYWORDS.some(keyword => name.includes(keyword));
};

export const checkPermissionRisk = (permissions: FolderPermission[]): {
  hasRisk: boolean;
  riskCount: number;
  details: string[];
} => {
  const details: string[] = [];
  let riskCount = 0;

  permissions.forEach(perm => {
    if (perm.memberStatus === 'graduated' && perm.permission === 'edit') {
      details.push(`${perm.memberName}（已毕业）仍拥有编辑权限`);
      riskCount++;
    }
    if (perm.memberStatus === 'collaboration_ended' && perm.permission !== 'read') {
      details.push(`${perm.memberName}（合作结束）仍拥有${getPermissionText(perm.permission)}权限`);
      riskCount++;
    }
  });

  return {
    hasRisk: riskCount > 0,
    riskCount,
    details
  };
};

export const getPermissionText = (permission: string): string => {
  const map: Record<string, string> = {
    read: '只读',
    edit: '编辑',
    admin: '管理'
  };
  return map[permission] || permission;
};

export const getStatusText = (status: MemberStatus): string => {
  const map: Record<MemberStatus, string> = {
    studying: '在读',
    graduated: '已毕业',
    collaboration_ended: '合作结束',
    external: '外校合作者'
  };
  return map[status] || status;
};

export const getCategoryText = (category: string): string => {
  const map: Record<string, string> = {
    paper: '论文资料',
    experiment: '实验数据',
    fund: '经费材料',
    graduation: '毕业交接'
  };
  return map[category] || category;
};

export const getHandoverTypeText = (type: string): string => {
  const map: Record<string, string> = {
    transfer: '应移交',
    revoke: '应收回',
    supervisor_confirm: '需导师确认'
  };
  return map[type] || type;
};

export const getSeverityText = (severity: string): string => {
  const map: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  };
  return map[severity] || severity;
};

export const generateHandoverReport = (handoverItems: any[]): string => {
  const transferItems = handoverItems.filter(item => item.type === 'transfer');
  const revokeItems = handoverItems.filter(item => item.type === 'revoke');
  const confirmItems = handoverItems.filter(item => item.type === 'supervisor_confirm');
  
  const completedCount = handoverItems.filter(item => item.status === 'completed').length;
  const totalCount = handoverItems.length;
  
  const report = [
    '=== 学期交接清单报告 ===',
    '',
    `统计概览:`,
    `  总项数: ${totalCount}`,
    `  已完成: ${completedCount}`,
    `  待处理: ${totalCount - completedCount}`,
    '',
    `应移交 (${transferItems.length} 项):`,
    ...transferItems.map(item => `  - ${item.folderName}: ${item.memberName} → ${item.targetMemberName || '指定接收人'}`),
    '',
    `应收回 (${revokeItems.length} 项):`,
    ...revokeItems.map(item => `  - ${item.folderName}: 收回 ${item.memberName} 的${getPermissionText(item.permission)}权限`),
    '',
    `需导师确认 (${confirmItems.length} 项):`,
    ...confirmItems.map(item => `  - ${item.folderName}: ${item.memberName} 的${getPermissionText(item.permission)}权限`),
    '',
    '=== 报告结束 ==='
  ].join('\n');
  
  return report;
};
