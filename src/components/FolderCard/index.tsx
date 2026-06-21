import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Folder } from '@/types';
import StatusTag from '@/components/StatusTag';
import { checkPermissionRisk, getPermissionText } from '@/utils/permission';

interface FolderCardProps {
  folder: Folder;
  showRisk?: boolean;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, showRisk = true }) => {
  const riskCheck = checkPermissionRisk(folder.permissions);

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/folder-detail/index?id=${folder.id}`
    });
    console.log('[FolderCard] Navigate to folder detail', { folderId: folder.id });
  };

  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      paper: '📄',
      experiment: '🔬',
      fund: '💰',
      graduation: '🎓'
    };
    return icons[folder.category] || '📁';
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={classnames(styles.iconContainer, styles[folder.category])}>
          <Text>{getCategoryIcon()}</Text>
        </View>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{folder.name}</Text>
          <View className={styles.tagRow}>
            {folder.isSensitive && <StatusTag type="sensitive" value="sensitive" />}
            {folder.sensitiveConfirmed && (
              <View className={styles.confirmedBadge}>
                <Text>✓ 已确认</Text>
              </View>
            )}
            {showRisk && riskCheck.hasRisk && (
              <View className={styles.riskBadge}>
                <Text className={styles.icon}>⚠️</Text>
                <Text>{riskCheck.riskCount}项风险</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Text className={styles.description}>{folder.description}</Text>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.icon}>📊</Text>
          <Text>{folder.fileCount}个文件</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.icon}>💾</Text>
          <Text>{folder.size}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.icon}>👥</Text>
          <Text>{folder.permissions.length}人可访问</Text>
        </View>
      </View>
    </View>
  );
};

export default FolderCard;
