import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { HandoverItem } from '@/types';
import { getHandoverTypeText } from '@/utils/permission';
import { useAppContext } from '@/store/AppContext';

interface HandoverItemProps {
  item: HandoverItem;
}

const HandoverItemCard: React.FC<HandoverItemProps> = ({ item }) => {
  const { updateHandoverStatus } = useAppContext();

  const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed';

  const handleStatusChange = (newStatus: HandoverItem['status']) => {
    const statusText: Record<string, string> = {
      confirmed: '确认处理中',
      completed: '完成交接'
    };

    Taro.showModal({
      title: '确认操作',
      content: `确认将该项标记为"${statusText[newStatus]}"？`,
      success: (res) => {
        if (res.confirm) {
          updateHandoverStatus(item.id, newStatus);
          Taro.showToast({
            title: '状态已更新',
            icon: 'success'
          });
          console.log('[HandoverItem] Status updated', { itemId: item.id, newStatus });
        }
      }
    });
  };

  const getStatusText = () => {
    const map: Record<string, string> = {
      pending: '待处理',
      confirmed: '处理中',
      completed: '已完成'
    };
    return map[item.status] || item.status;
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <View className={classnames(styles.typeTag, styles[item.type])}>
            <Text>{getHandoverTypeText(item.type)}</Text>
          </View>
          <Text className={styles.title}>{item.title}</Text>
        </View>
        <View className={classnames(styles.statusBadge, styles[item.status])}>
          <Text>{getStatusText()}</Text>
        </View>
      </View>

      <Text className={styles.description}>{item.description}</Text>

      {item.notes && (
        <Text className={styles.notes}>📝 {item.notes}</Text>
      )}

      <View className={styles.metaRow}>
        <Text className={classnames(styles.dueDate, isOverdue && styles.overdue)}>
          截止日期：{item.dueDate} {isOverdue && '（已逾期）'}
        </Text>
        <View className={styles.actionBtns}>
          {item.status === 'pending' && (
            <>
              <Button
                className={classnames(styles.actionBtn, styles.secondary)}
                onClick={() => handleStatusChange('confirmed')}
              >
                确认处理
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.success)}
                onClick={() => handleStatusChange('completed')}
              >
                完成
              </Button>
            </>
          )}
          {item.status === 'confirmed' && (
            <Button
              className={classnames(styles.actionBtn, styles.success)}
              onClick={() => handleStatusChange('completed')}
            >
              标记完成
            </Button>
          )}
          {item.status === 'completed' && (
            <Text style={{ fontSize: '24rpx', color: '#00B42A', fontWeight: '500' }}>✓ 已完成</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default HandoverItemCard;
