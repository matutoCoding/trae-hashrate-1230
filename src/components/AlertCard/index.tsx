import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Alert } from '@/types';
import { getSeverityText } from '@/utils/permission';
import { useAppContext } from '@/store/AppContext';

interface AlertCardProps {
  alert: Alert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { resolveAlert } = useAppContext();

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.showModal({
      title: '确认处理',
      content: `确认已处理该风险预警：${alert.title}？`,
      success: (res) => {
        if (res.confirm) {
          resolveAlert(alert.id);
          Taro.showToast({
            title: '已标记为已处理',
            icon: 'success'
          });
          console.log('[AlertCard] Alert resolved', { alertId: alert.id });
        }
      }
    });
  };

  const handleClick = () => {
    if (alert.folderId) {
      Taro.navigateTo({
        url: `/pages/folder-detail/index?id=${alert.folderId}`
      });
    } else if (alert.memberId) {
      Taro.navigateTo({
        url: `/pages/member-detail/index?id=${alert.memberId}`
      });
    }
  };

  return (
    <View
      className={classnames(styles.card, styles[alert.severity], alert.isResolved && styles.resolved)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <Text className={styles.title}>{alert.title}</Text>
        <View className={styles.badgeGroup}>
          {alert.type === 'sensitive_folder' && alert.isSensitiveConfirmed && (
            <View className={styles.confirmedBadge}>
              <Text>✓ 已确认</Text>
            </View>
          )}
          <View className={classnames(styles.severityBadge, styles[alert.severity])}>
            <Text>{getSeverityText(alert.severity)}</Text>
          </View>
        </View>
      </View>

      <Text className={styles.description}>{alert.description}</Text>

      <View className={styles.metaRow}>
        <Text className={styles.metaItem}>{alert.createdAt}</Text>
        {!alert.isResolved ? (
          <Button className={styles.actionBtn} onClick={handleResolve}>
            标记已处理
          </Button>
        ) : (
          <Text className={styles.resolvedBadge}>✓ 已处理</Text>
        )}
      </View>
    </View>
  );
};

export default AlertCard;
