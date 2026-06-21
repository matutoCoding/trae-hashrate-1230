import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import StatusTag from '@/components/StatusTag';
import type { MemberStatus, FolderPermission } from '@/types';
import { getStatusText, getPermissionText } from '@/utils/permission';

const roleTextMap: Record<string, string> = {
  supervisor: '导师',
  secretary: '课题秘书',
  student: '研究生',
  collaborator: '合作者'
};

const statusOptions: { key: MemberStatus; label: string }[] = [
  { key: 'studying', label: '在读' },
  { key: 'graduated', label: '已毕业' },
  { key: 'collaboration_ended', label: '合作结束' },
  { key: 'external', label: '外校合作者' }
];

const categoryIcons: Record<string, string> = {
  paper: '📄',
  experiment: '🔬',
  fund: '💰',
  graduation: '🎓'
};

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const { getMemberById, folders, updateMemberStatus, refreshStatistics } = useAppContext();
  const memberId = router.params.id as string;
  const member = getMemberById(memberId);
  const [localStatus, setLocalStatus] = useState<MemberStatus | null>(null);

  const currentStatus = localStatus || member?.status || 'studying';

  const memberFolders = useMemo(() => {
    if (!member) return [];
    const result: { folderId: string; folderName: string; category: string; isSensitive: boolean; permission: FolderPermission }[] = [];

    folders.forEach(folder => {
      const perm = folder.permissions.find(p => p.memberId === member.id);
      if (perm) {
        result.push({
          folderId: folder.id,
          folderName: folder.name,
          category: folder.category,
          isSensitive: folder.isSensitive,
          permission: perm
        });
      }
    });

    return result;
  }, [member, folders]);

  const riskItems = useMemo(() => {
    if (!member) return [];
    const risks: string[] = [];

    memberFolders.forEach(item => {
      if (currentStatus === 'graduated' && item.permission.permission === 'edit') {
        risks.push(`"${item.folderName}" - 已毕业仍有编辑权限`);
      }
      if (currentStatus === 'collaboration_ended' && item.permission.permission !== 'read') {
        risks.push(`"${item.folderName}" - 合作结束仍有${getPermissionText(item.permission.permission)}权限`);
      }
    });

    return risks;
  }, [member, memberFolders, currentStatus]);

  if (!member) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.icon}>👤</Text>
          <Text className={styles.text}>成员不存在</Text>
        </View>
      </View>
    );
  }

  const handleStatusChange = (status: MemberStatus) => {
    setLocalStatus(status);
    console.log('[MemberDetail] Status selected', { memberId, status });
  };

  const handleSaveStatus = () => {
    if (!localStatus || localStatus === member.status) return;

    Taro.showModal({
      title: '确认修改状态',
      content: `确认将"${member.name}"的状态从"${getStatusText(member.status)}"修改为"${getStatusText(localStatus)}"？`,
      success: (res) => {
        if (res.confirm) {
          updateMemberStatus(member.id, localStatus);
          refreshStatistics();
          Taro.showToast({
            title: '状态已更新',
            icon: 'success'
          });
          console.log('[MemberDetail] Status updated', { memberId, oldStatus: member.status, newStatus: localStatus });
        }
      }
    });
  };

  const handleFolderClick = (folderId: string) => {
    Taro.navigateTo({
      url: `/pages/folder-detail/index?id=${folderId}`
    });
    console.log('[MemberDetail] Navigate to folder detail', { folderId });
  };

  const hasRisk = (item: typeof memberFolders[0]) => {
    if (currentStatus === 'graduated' && item.permission.permission === 'edit') return true;
    if (currentStatus === 'collaboration_ended' && item.permission.permission !== 'read') return true;
    return false;
  };

  return (
    <View className={styles.container}>
      <View className={styles.memberHeader}>
        <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
        <View className={styles.memberInfo}>
          <Text className={styles.memberName}>{member.name}</Text>
          <View>
            <Text className={styles.roleTag}>{roleTextMap[member.role]}</Text>
            <StatusTag type="status" value={currentStatus} />
          </View>
          <Text className={styles.department}>📍 {member.department}</Text>
          <Text className={styles.email}>✉️ {member.email}</Text>
        </View>
      </View>

      <View className={styles.statusSection}>
        <Text className={styles.sectionLabel}>身份状态</Text>
        <View className={styles.currentStatus}>
          <Text style={{ fontSize: '28rpx', color: '#4E5969' }}>当前状态：</Text>
          <StatusTag type="status" value={currentStatus} />
        </View>
        <Text className={styles.sectionLabel}>修改状态</Text>
        <View className={styles.statusOptions}>
          {statusOptions.map(option => (
            <Button
              key={option.key}
              className={classnames(
                styles.statusOption,
                currentStatus === option.key && styles.active,
                currentStatus === option.key && styles[option.key]
              )}
              onClick={() => handleStatusChange(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </View>
        {localStatus && localStatus !== member.status && (
          <Button
            className={classnames(styles.statusOption, styles.active)}
            style={{
              marginTop: '24rpx',
              width: '100%',
              height: '80rpx',
              background: '#1E5EBE',
              color: '#fff',
              border: 'none'
            }}
            onClick={handleSaveStatus}
          >
            保存状态
          </Button>
        )}
      </View>

      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>加入时间</Text>
          <Text className={styles.value}>{member.joinDate}</Text>
        </View>
        {member.endDate && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>结束时间</Text>
            <Text className={styles.value}>{member.endDate}</Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <Text className={styles.label}>可访问文件夹</Text>
          <Text className={styles.value}>{memberFolders.length} 个</Text>
        </View>
      </View>

      {riskItems.length > 0 && (
        <View className={styles.riskAlert}>
          <View className={styles.alertHeader}>
            <Text className={styles.icon}>⚠️</Text>
            <Text className={styles.title}>权限风险提醒</Text>
          </View>
          <Text className={styles.alertDesc}>
            该成员当前状态与以下文件夹权限存在不匹配，请及时处理：
          </Text>
          {riskItems.map((item, index) => (
            <Text key={index} className={styles.alertItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>可访问文件夹</Text>
          <Text className={styles.count}>共 {memberFolders.length} 个</Text>
        </View>

        {memberFolders.length > 0 ? (
          <View className={styles.folderList}>
            {memberFolders.map(item => (
              <View
                key={item.folderId}
                className={classnames(styles.folderItem, hasRisk(item) && styles.hasRisk)}
                onClick={() => handleFolderClick(item.folderId)}
              >
                <View className={classnames(styles.folderIcon, styles[item.category])}>
                  <Text>{categoryIcons[item.category] || '📁'}</Text>
                </View>
                <View className={styles.folderInfo}>
                  <Text className={styles.folderName}>{item.folderName}</Text>
                  <View className={styles.folderMeta}>
                    <View
                      className={classnames(
                        styles.permissionTag,
                        styles[item.permission.permission]
                      )}
                    >
                      {getPermissionText(item.permission.permission)}
                    </View>
                    {item.isSensitive && (
                      <View className={styles.sensitiveTag}>敏感目录</View>
                    )}
                    {hasRisk(item) && <View className={styles.riskIndicator} />}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📭</Text>
            <Text className={styles.text}>暂无访问权限</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MemberDetailPage;
