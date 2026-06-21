import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import HandoverItemCard from '@/components/HandoverItem';
import type { HandoverItem, HandoverType, HandoverReport } from '@/types';
import { getHandoverTypeText, generateHandoverReport } from '@/utils/permission';

const typeFilters: { key: HandoverType | 'all'; label: string; className?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'transfer', label: '应移交', className: 'transfer' },
  { key: 'revoke', label: '应收回', className: 'revoke' },
  { key: 'supervisor_confirm', label: '需确认', className: 'confirm' }
];

const HandoverPage: React.FC = () => {
  const { handoverItems, updateHandoverStatus, refreshStatistics, resetData } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<HandoverType | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const report: HandoverReport = useMemo(
    () => generateHandoverReport(handoverItems),
    [handoverItems]
  );

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
  };

  const handleGenerateReport = () => {
    Taro.showModal({
      title: '生成交接报告',
      content: `确认生成${report.semester}交接清单报告？\n\n共 ${report.summary.total} 项交接任务，其中：\n• 应移交：${report.summary.transfer} 项\n• 应收回：${report.summary.revoke} 项\n• 需导师确认：${report.summary.supervisorConfirm} 项\n• 已完成：${report.summary.completed} 项\n• 进行中：${report.summary.inProgress} 项`,
      success: (res) => {
        if (res.confirm) {
          setShowReport(true);
          Taro.showToast({
            title: '报告已生成',
            icon: 'success'
          });
        }
      }
    });
  };

  const toggleCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  const handleStatusChange = (item: HandoverItem, newStatus: HandoverItem['status']) => {
    Taro.showModal({
      title: '确认更新状态',
      content: `确认将"${item.title}"的状态更新为"${newStatus === 'completed' ? '已完成' : newStatus === 'confirmed' ? '已确认' : '待处理'}"？`,
      success: (res) => {
        if (res.confirm) {
          updateHandoverStatus(item.id, newStatus);
        }
      }
    });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置数据',
      content: '确认要重置所有数据吗？这将清除所有本地修改。',
      success: (res) => {
        if (res.confirm) {
          resetData();
        }
      }
    });
  };

  const renderReportSection = (title: string, items: HandoverItem[], type: HandoverType) => (
    <View className={styles.reportSection}>
      <View className={styles.reportSectionHeader}>
        <Text className={classnames(styles.reportSectionTitle, styles[type])}>{title}</Text>
        <Text className={styles.reportSectionCount}>{items.length} 项</Text>
      </View>
      {items.length > 0 ? (
        items.map(item => (
          <View key={item.id} className={styles.reportItem}>
            <View className={styles.reportItemHeader}>
              <Text className={styles.reportItemTitle}>{item.title}</Text>
              <Text className={classnames(
                styles.reportItemStatus,
                item.status === 'completed' && styles.statusCompleted,
                item.status === 'confirmed' && styles.statusConfirmed,
                item.status === 'pending' && styles.statusPending
              )}>
                {item.status === 'completed' ? '已完成' : item.status === 'confirmed' ? '已确认' : '待处理'}
              </Text>
            </View>
            <Text className={styles.reportItemDesc}>{item.description}</Text>
            {item.folderName && (
              <Text className={styles.reportItemMeta}>文件夹：{item.folderName}</Text>
            )}
            {item.memberName && (
              <Text className={styles.reportItemMeta}>
                相关人员：{item.memberName}
                {item.targetMemberName && ` → ${item.targetMemberName}`}
              </Text>
            )}
          </View>
        ))
      ) : (
        <View className={styles.reportEmpty}>
          <Text>暂无此项</Text>
        </View>
      )}
    </View>
  );

  if (showReport) {
    return (
      <View className={styles.container}>
        <View className={styles.reportHeader}>
          <View className={styles.reportHeaderContent}>
            <Text className={styles.reportTitle}>📋 交接清单报告</Text>
            <Text className={styles.reportSemester}>{report.semester}</Text>
            <Text className={styles.reportDate}>生成日期：{report.generatedAt}</Text>
          </View>
          <Button className={styles.closeReportBtn} onClick={() => setShowReport(false)}>
            返回列表
          </Button>
        </View>

        <ScrollView className={styles.reportContent} scrollY>
          <View className={styles.reportSummary}>
            <Text className={styles.summaryTitle}>📊 统计概览</Text>
            <View className={styles.summaryGrid}>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryValue}>{report.summary.total}</Text>
                <Text className={styles.summaryLabel}>总项数</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryValue}>{report.summary.completed}</Text>
                <Text className={styles.summaryLabel}>已完成</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryValue}>{report.summary.inProgress}</Text>
                <Text className={styles.summaryLabel}>进行中</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryValue}>{report.summary.pending}</Text>
                <Text className={styles.summaryLabel}>待处理</Text>
              </View>
            </View>
            <View className={styles.summaryProgress}>
              <View className={styles.progressLabelRow}>
                <Text className={styles.progressLabel}>完成进度</Text>
                <Text className={styles.progressPercent}>{progressPercent}%</Text>
              </View>
              <View className={styles.progressTrack}>
                <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </View>
            </View>
          </View>

          {renderReportSection('📤 应移交', report.items.transfer, 'transfer')}
          {renderReportSection('🔴 应收回', report.items.revoke, 'revoke')}
          {renderReportSection('✋ 需导师确认', report.items.supervisorConfirm, 'supervisor_confirm')}

          <View className={styles.reportFooter}>
            <Text className={styles.reportFooterText}>报告由系统自动生成</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

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
          <View className={styles.actionRow}>
            <Button className={styles.action} onClick={handleGenerateReport}>
              生成报告
            </Button>
            <Button className={styles.resetBtn} onClick={handleReset}>
              重置数据
            </Button>
          </View>
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
            <HandoverItemCard
              key={item.id}
              item={item}
              onStatusChange={(status) => handleStatusChange(item, status)}
            />
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
