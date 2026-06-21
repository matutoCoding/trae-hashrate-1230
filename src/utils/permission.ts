import type { FolderPermission, MemberStatus, HandoverItem, HandoverReport } from '@/types';

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

export const generateHandoverReport = (handoverItems: HandoverItem[]): HandoverReport => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const semester = month <= 6 ? `${year - 1}-${year}学年第二学期` : `${year}-${year + 1}学年第一学期`;
  
  const transferItems = handoverItems.filter(item => item.type === 'transfer');
  const revokeItems = handoverItems.filter(item => item.type === 'revoke');
  const confirmItems = handoverItems.filter(item => item.type === 'supervisor_confirm');
  
  const completedCount = handoverItems.filter(item => item.status === 'completed').length;
  const pendingCount = handoverItems.filter(item => item.status === 'pending').length;
  const confirmedCount = handoverItems.filter(item => item.status === 'confirmed').length;
  const totalCount = handoverItems.length;
  
  return {
    semester,
    generatedAt: `${year}年${month}月${now.getDate()}日`,
    summary: {
      total: totalCount,
      completed: completedCount,
      inProgress: confirmedCount,
      pending: pendingCount,
      transfer: transferItems.length,
      revoke: revokeItems.length,
      supervisorConfirm: confirmItems.length
    },
    items: {
      transfer: transferItems,
      revoke: revokeItems,
      supervisorConfirm: confirmItems
    }
  };
};

export const generateHandoverReportText = (handoverItems: HandoverItem[]): string => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const semester = month <= 6 ? `${year - 1}-${year}学年第二学期` : `${year}-${year + 1}学年第一学期`;
  const dateStr = `${year}年${month}月${now.getDate()}日`;

  const transferItems = handoverItems.filter(item => item.type === 'transfer');
  const revokeItems = handoverItems.filter(item => item.type === 'revoke');
  const confirmItems = handoverItems.filter(item => item.type === 'supervisor_confirm');

  const completedCount = handoverItems.filter(item => item.status === 'completed').length;
  const pendingCount = handoverItems.filter(item => item.status === 'pending').length;
  const inProgressCount = handoverItems.filter(item => item.status === 'confirmed').length;
  const totalCount = handoverItems.length;

  const today = new Date().toISOString().split('T')[0];
  const overdueItems = handoverItems.filter(item => item.status !== 'completed' && item.dueDate < today);
  const unconfirmedSensitive = confirmItems.filter(item => item.status !== 'completed');

  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════');
  lines.push('          课题组权限交接报告');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`【学期】${semester}`);
  lines.push(`【生成日期】${dateStr}`);
  lines.push('');
  lines.push('───────────────────────────────────────────');
  lines.push('                一、概览统计');
  lines.push('───────────────────────────────────────────');
  lines.push(`  • 交接项总数：${totalCount} 项`);
  lines.push(`  • 已完成：${completedCount} 项`);
  lines.push(`  • 进行中：${inProgressCount} 项`);
  lines.push(`  • 待处理：${pendingCount} 项`);
  lines.push(`  • 完成进度：${totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0}%`);
  lines.push('');
  lines.push('───────────────────────────────────────────');
  lines.push('               二、未完成项清单');
  lines.push('───────────────────────────────────────────');

  const unfinished = handoverItems.filter(item => item.status !== 'completed');
  if (unfinished.length > 0) {
    unfinished.forEach((item, idx) => {
      const statusText = item.status === 'pending' ? '待处理' : '进行中';
      lines.push(`  ${idx + 1}. [${statusText}] ${item.title}`);
      lines.push(`     类型：${getHandoverTypeText(item.type)} | 截止：${item.dueDate}`);
      if (item.memberName) lines.push(`     成员：${item.memberName}`);
      if (item.folderName) lines.push(`     文件夹：${item.folderName}`);
      lines.push('');
    });
  } else {
    lines.push('  ✅ 所有交接项已完成');
    lines.push('');
  }

  lines.push('───────────────────────────────────────────');
  lines.push('               三、逾期项预警');
  lines.push('───────────────────────────────────────────');

  if (overdueItems.length > 0) {
    overdueItems.forEach((item, idx) => {
      lines.push(`  ${idx + 1}. ⚠️ ${item.title}`);
      lines.push(`     截止日期：${item.dueDate}（已逾期）`);
      if (item.memberName) lines.push(`     责任人：${item.memberName}`);
      lines.push('');
    });
  } else {
    lines.push('  ✅ 无逾期项');
    lines.push('');
  }

  lines.push('───────────────────────────────────────────');
  lines.push('           四、需导师二次确认目录');
  lines.push('───────────────────────────────────────────');

  if (unconfirmedSensitive.length > 0) {
    unconfirmedSensitive.forEach((item, idx) => {
      const statusText = item.status === 'pending' ? '待确认' : '确认中';
      lines.push(`  ${idx + 1}. [${statusText}] ${item.title}`);
      if (item.folderName) lines.push(`     目录：${item.folderName}`);
      lines.push(`     截止日期：${item.dueDate}`);
      lines.push('');
    });
  } else {
    lines.push('  ✅ 所有需确认目录已处理完毕');
    lines.push('');
  }

  lines.push('───────────────────────────────────────────');
  lines.push('               五、分类明细');
  lines.push('───────────────────────────────────────────');

  lines.push('');
  lines.push('  【应移交】（' + transferItems.length + ' 项）');
  if (transferItems.length > 0) {
    transferItems.forEach((item, idx) => {
      const icon = item.status === 'completed' ? '✅' : item.status === 'confirmed' ? '🔄' : '⏳';
      lines.push(`    ${icon} ${idx + 1}. ${item.title}`);
    });
  } else {
    lines.push('    （无）');
  }

  lines.push('');
  lines.push('  【应收回】（' + revokeItems.length + ' 项）');
  if (revokeItems.length > 0) {
    revokeItems.forEach((item, idx) => {
      const icon = item.status === 'completed' ? '✅' : item.status === 'confirmed' ? '🔄' : '⏳';
      lines.push(`    ${icon} ${idx + 1}. ${item.title}`);
    });
  } else {
    lines.push('    （无）');
  }

  lines.push('');
  lines.push('  【需导师确认】（' + confirmItems.length + ' 项）');
  if (confirmItems.length > 0) {
    confirmItems.forEach((item, idx) => {
      const icon = item.status === 'completed' ? '✅' : item.status === 'confirmed' ? '🔄' : '⏳';
      lines.push(`    ${icon} ${idx + 1}. ${item.title}`);
    });
  } else {
    lines.push('    （无）');
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════');
  lines.push('              报告结束');
  lines.push('═══════════════════════════════════════════');

  return lines.join('\n');
};
