import React, { useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import StatusTag from '@/components/StatusTag';
import type { FolderPermission } from '@/types';
import { getCategoryText, getPermissionText, getStatusText, checkPermissionRisk, isSensitiveFolder } from '@/utils/permission';
import { getMemberById } from '@/data/members';

const categoryIcons: Record<string, string> = {
  paper: '📄',
  experiment: '🔬',
  fund: '💰',
  graduation: '🎓'
};

const FolderDetailPage: React.FC = () => {
  const router = useRouter();
  const { getFolderById, resolveAlert } = useAppContext();
  const folderId = router.params.id as string;
  const folder = getFolderById(folderId);

  const riskCheck = useMemo(() => {
    if (!folder) return { hasRisk: false, riskCount: 0, details: [] };
    return checkPermissionRisk(folder.permissions);
  }, [folder]);

  if (!folder) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.icon}>📭</Text>
          <Text className={styles.text}>文件夹不存在</Text>
        </View>
      </View>
    );
  }

  const handleConfirmSensitive = () => {
    Taro.showModal({
      title: '确认共享范围',
      content: `请确认"${folder.name}"的共享范围：\n\n当前共有 ${folder.permissions.length} 人可访问此目录：\n${folder.permissions.map(p => `• ${p.memberName}（${getStatusText(p.memberStatus)}） - ${getPermissionText(p.permission)}`).join('\n')}\n\n请确认以上人员是否均有权限访问此敏感目录。`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已确认共享范围',
            icon: 'success'
          });
          console.log('[FolderDetail] Sensitive folder access confirmed', { folderId: folder.id });
        }
      }
    });
  };

  const handleMemberClick = (memberId: string) => {
    Taro.navigateTo({
      url: `/pages/member-detail/index?id=${memberId}`
    });
    console.log('[FolderDetail] Navigate to member detail', { memberId });
  };

  const hasPermissionRisk = (perm: FolderPermission) => {
    if (perm.memberStatus === 'graduated' && perm.permission === 'edit') return true;
    if (perm.memberStatus === 'collaboration_ended' && perm.permission !== 'read') return true;
    return false;
  };

  return (
    <View className={styles.container}>
      <View className={styles.folderHeader}>
        <View className={styles.categoryIcon}>
          <Text>{categoryIcons[folder.category] || '📁'}</Text>
        </View>
        <Text className={styles.folderName}>{folder.name}</Text>
        <Text className={styles.folderPath}>📁 {folder.path}</Text>
        <View className={styles.tagRow}>
          <StatusTag type="status" value={folder.category} />
          {folder.isSensitive && <StatusTag type="sensitive" value="sensitive" />}
        </View>
      </View>

      <View className={styles.infoCard}>
        <View className={styles.description}>{folder.description}</View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>文件数量</Text>
          <Text className={styles.value}>{folder.fileCount} 个</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>文件夹大小</Text>
          <Text className={styles.value}>{folder.size}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>更新时间</Text>
          <Text className={styles.value}>{folder.updatedAt}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>可访问人数</Text>
          <Text className={styles.value}>{folder.permissions.length} 人</Text>
        </View>
      </View>

      {folder.isSensitive && (
        <View className={styles.sensitiveAlert}>
          <View className={styles.alertHeader}>
            <Text className={styles.icon}>⚠️</Text>
            <Text className={styles.title}>敏感目录提醒</Text>
          </View>
          <Text className={styles.alertDesc}>
            此目录包含敏感信息，请仔细核对共享人员列表，确保仅授权人员可访问。
          </Text>
          <Button className={styles.alertBtn} onClick={handleConfirmSensitive}>
            确认共享范围
          </Button>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>权限风险检测</Text>
          <Text className={styles.count}>{riskCheck.riskCount} 项风险</Text>
        </View>

        {riskCheck.hasRisk && (
          <View className={styles.riskSummary}>
            {riskCheck.details.map((detail, index) => (
              <Text key={index} className={styles.riskItem}>
                ⚠️ {detail}
              </Text>
            ))}
          </View>
        )}

        <View className={styles.sectionTitle}>
          <Text>可访问人员</Text>
          <Text className={styles.count}>共 {folder.permissions.length} 人</Text>
        </View>

        <View className={styles.permissionList}>
          {folder.permissions.map((perm, index) => {
            const member = getMemberById(perm.memberId);
            const hasRisk = hasPermissionRisk(perm);
            return (
              <View
                key={perm.memberId}
                className={classnames(styles.permissionItem, hasRisk && styles.hasRisk)}
                onClick={() => handleMemberClick(perm.memberId)}
              >
                <Image
                  className={styles.memberAvatar}
                  src={member?.avatar || 'https://picsum.photos/id/1005/200/200'}
                  mode="aspectFill"
                />
                <View className={styles.memberInfo}>
                  <View className={styles.memberNameRow}>
                    <Text className={styles.memberName}>{perm.memberName}</Text>
                    <StatusTag type="status" value={perm.memberStatus} />
                    <View
                      className={classnames(
                        styles.permissionLevel,
                        styles[perm.permission]
                      )}
                    >
                      {getPermissionText(perm.permission)}
                    </View>
                    {hasRisk && <View className={styles.riskIndicator} />}
                  </View>
                  <Text className={styles.permissionMeta}>
                    授予于 {perm.grantedAt} · 由 {perm.grantedBy} 授予
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default FolderDetailPage;
