import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import AlertCard from '@/components/AlertCard';
import type { Alert } from '@/types';

const severityFilters: { key: Alert['severity'] | 'all'; label: string; className?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高风险', className: 'high' },
  { key: 'medium', label: '中风险', className: 'medium' },
  { key: 'low', label: '低风险', className: 'low' }
];

const AlertsPage: React.FC = () => {
  const { alerts, refreshStatistics } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<Alert['severity'] | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [confirmedFilter, setConfirmedFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');

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

  const activeAlerts = useMemo(() => alerts.filter(a => !a.isResolved), [alerts]);
  const resolvedAlerts = useMemo(() => alerts.filter(a => a.isResolved), [alerts]);

  const filteredAlerts = useMemo(() => {
    let list = showResolved ? resolvedAlerts : activeAlerts;
    if (activeFilter !== 'all') {
      list = list.filter(a => a.severity === activeFilter);
    }
    if (confirmedFilter === 'confirmed') {
      list = list.filter(a => a.isSensitiveConfirmed === true);
    } else if (confirmedFilter === 'unconfirmed') {
      list = list.filter(a => a.isSensitiveConfirmed === false);
    }
    return list;
  }, [activeAlerts, resolvedAlerts, activeFilter, showResolved, confirmedFilter]);

  const stats = useMemo(() => {
    return {
      total: activeAlerts.length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length,
      low: activeAlerts.filter(a => a.severity === 'low').length,
      unconfirmedSensitive: activeAlerts.filter(a => a.type === 'sensitive' && a.isSensitiveConfirmed === false).length,
      confirmedSensitive: activeAlerts.filter(a => a.type === 'sensitive' && a.isSensitiveConfirmed === true).length
    };
  }, [activeAlerts]);

  const handleFilterChange = (key: Alert['severity'] | 'all') => {
    setActiveFilter(key);
    console.log('[AlertsPage] Filter changed', { key });
  };

  const handleConfirmedFilterChange = (key: 'all' | 'confirmed' | 'unconfirmed') => {
    setConfirmedFilter(key);
    console.log('[AlertsPage] Confirmed filter changed', { key });
  };

  const toggleResolved = () => {
    setShowResolved(!showResolved);
    console.log('[AlertsPage] Toggle resolved alerts', { showResolved: !showResolved });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>风险预警</Text>
        <Text className={styles.pageDesc}>及时处理权限风险，保护科研数据安全</Text>

        <View className={styles.statCards}>
          <View className={classnames(styles.statCard, styles.high)}>
            <Text className={styles.value}>{stats.high}</Text>
            <Text className={styles.label}>高风险</Text>
          </View>
          <View className={classnames(styles.statCard, styles.medium)}>
            <Text className={styles.value}>{stats.medium}</Text>
            <Text className={styles.label}>中风险</Text>
          </View>
          <View className={classnames(styles.statCard, styles.low)}>
            <Text className={styles.value}>{stats.low}</Text>
            <Text className={styles.label}>低风险</Text>
          </View>
        </View>

        <View className={styles.sensitiveStats}>
          <View className={classnames(styles.sensitiveStat, styles.unconfirmed)}>
            <Text className={styles.icon}>⚠️</Text>
            <View className={styles.sensitiveInfo}>
              <Text className={styles.sensitiveCount}>{stats.unconfirmedSensitive}</Text>
              <Text className={styles.sensitiveLabel}>待确认敏感目录</Text>
            </View>
          </View>
          <View className={classnames(styles.sensitiveStat, styles.confirmed)}>
            <Text className={styles.icon}>✅</Text>
            <View className={styles.sensitiveInfo}>
              <Text className={styles.sensitiveCount}>{stats.confirmedSensitive}</Text>
              <Text className={styles.sensitiveLabel}>已确认敏感目录</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        {severityFilters.map(filter => (
          <View
            key={filter.key}
            className={classnames(
              styles.filterItem,
              activeFilter === filter.key && styles.active,
              activeFilter === filter.key && styles[filter.className || '']
            )}
            onClick={() => handleFilterChange(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.subFilterBar}>
        <View
          className={classnames(styles.subFilterItem, confirmedFilter === 'all' && styles.active)}
          onClick={() => handleConfirmedFilterChange('all')}
        >
          <Text>全部敏感目录</Text>
        </View>
        <View
          className={classnames(styles.subFilterItem, confirmedFilter === 'unconfirmed' && styles.active, styles.unconfirmed)}
          onClick={() => handleConfirmedFilterChange('unconfirmed')}
        >
          <Text>待确认</Text>
        </View>
        <View
          className={classnames(styles.subFilterItem, confirmedFilter === 'confirmed' && styles.active, styles.confirmed)}
          onClick={() => handleConfirmedFilterChange('confirmed')}
        >
          <Text>已确认</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionTitle}>
          <Text>{showResolved ? '已处理风险' : '待处理风险'}</Text>
          <Text className={styles.count}>共 {filteredAlerts.length} 项</Text>
        </View>

        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>✅</Text>
            <Text className={styles.text}>暂无风险项</Text>
          </View>
        )}

        <View className={styles.resolvedSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle} style={{ margin: 0 }}>
              历史记录
            </Text>
            <Text className={styles.toggle} onClick={toggleResolved}>
              {showResolved ? '收起' : '查看已处理'} ›
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AlertsPage;
