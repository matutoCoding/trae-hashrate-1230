import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import HandoverItemCard from '@/components/HandoverItem';
import type { HandoverItem, HandoverType } from '@/types';
import { getHandoverTypeText, generateHandoverReport } from '@/utils/permission';

const typeFilters: { key: HandoverType | 'all'; label: string; className?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'transfer', label: '应移交', className: 'transfer' },
  { key: 'revoke', label: '应收回', className: 'revoke' },
  { key: 'supervisor_confirm', label: '需确认', className: 'confirm' }
];

const HandoverPage: React.FC = () => {
  const { handoverItems, refreshStatistics } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<HandoverType | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const report = useMemo(() => generateHandoverReport(), []);

  usePullDownRefresh(() => {
    refreshStatistics();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  });

  const pendingItems = useMemo(
    () => handoverItems.filter(h => h.status !== 'completed'),
    [handoverItems]
  );
  const completedItems = useMemo(
    () => handoverItems.filter(h => h.status === 'completed'),
    [handoverItems]
  );

  const displayItems = useMemo(() => {
    let list = showCompleted ? completedItems : pendingItems;
    if (activeFilter === 'all') return list;
    return list.filter(h => h.type === activeFilter);
  }, [pendingItems, completedItems, activeFilter, showCompleted]);

  const stats = useMemo(() => {
    return {
      total: handoverItems.length,
      completed: handoverItems.filter(h => h.status === 'completed').length,
      pending: handoverItems.filter(h => h.status === 'pending').length,
      confirmed: handoverItems.filter(h => h.status === 'confirmed').length,
      transfer: handoverItems.filter(h => h.type === 'transfer').length,
      revoke: handoverItems.filter(h => h.type === 'revoke').length,
      supervisorConfirm: handoverItems.filter(h => h.type === 'supervisor_confirm').length
    };
  }, [handoverItems]);

  const progressPercent = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const handleFilterChange = (key: HandoverType | 'all') => {
    setActiveFilter(key);
    console.log('[HandoverPage] Filter changed', { key });
  };

  const handleGenerateReport = () => {
    Taro.showModal({
      title: '生成交接报告',
      content: `确认生成${report.semester}交接清单报告？\n\n共 ${report.summary.total} 项交接任务，其中：\n• 应移交：${report.summary.transfer} 项\n• 应收回：${report.summary.revoke} 项\n• 需导师确认：${report.summary.supervisorConfirm} 项\n• 已完成：${report.summary.completed} 项\n• 进行中：${report.summary.inProgress} 项`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '报告已生成',
            icon: 'success'
          });
          console.log('[HandoverPage] Report generated', report);
        }
      }
    });
  };

  const toggleCompleted = () => {
    setShowCompleted(!showCompleted);
    console.log('[HandoverPage] Toggle completed items', { showCompleted: !showCompleted });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>交接清单</Text>
        <Text className={styles.pageDesc}>学期末权限交接管理，保障科研资料安全</Text>

        <View className={styles.semesterInfo}>
          <View className={styles.info}>
            <Text className={styles.semester}>{report.semester}</Text>
            <Text className={styles.date}>生成日期：{report.generatedAt}</Text>
          </View>
          <Button className={styles.action} onClick={handleGenerateReport}>
            生成报告
          </Button>
        </View>

        <View className={styles.statRow}>
          <View className={classnames(styles.statItem, styles.transfer)}>
            <Text className={styles.value}>{stats.transfer}</Text>
            <Text className={styles.label}>应移交</Text>
          </View>
          <View className={classnames(styles.statItem, styles.revoke)}>
            <Text className={styles.value}>{stats.revoke}</Text>
            <Text className={styles.label}>应收回</Text>
          </View>
          <View className={classnames(styles.statItem, styles.confirm)}>
            <Text className={styles.value}>{stats.supervisorConfirm}</Text>
            <Text className={styles.label}>需确认</Text>
          </View>
        </View>
      </View>

      <View className={styles.typeFilter}>
        {typeFilters.map(filter => (
          <View
            key={filter.key}
            className={classnames(
              styles.typeItem,
              activeFilter === filter.key && styles.active,
              activeFilter === filter.key && styles[filter.className || '']
            )}
            onClick={() => handleFilterChange(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        <View className={styles.progressBar}>
          <View className={styles.progressHeader}>
            <Text className={styles.label}>交接进度</Text>
            <Text className={styles.percent}>{progressPercent}%</Text>
          </View>
          <View className={styles.progressTrack}>
            <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </View>
        </View>

        <View className={styles.sectionTitle}>
          <Text>{showCompleted ? '已完成交接' : '待处理交接'}</Text>
          <Text
            className={styles.count}
            onClick={toggleCompleted}
            style={{ color: '#1E5EBE' }}
          >
            {showCompleted ? '查看待处理' : '查看已完成'} ›
          </Text>
        </View>

        {displayItems.length > 0 ? (
          displayItems.map(item => (
            <HandoverItemCard key={item.id} item={item} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>暂无交接项</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HandoverPage;
