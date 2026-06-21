import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import type { AuditLog, AuditLogType } from '@/types';

const typeFilters: { key: AuditLogType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'member_status_change', label: '成员状态' },
  { key: 'alert_resolved', label: '风险处理' },
  { key: 'sensitive_confirmed', label: '敏感目录确认' },
  { key: 'handover_completed', label: '交接处理' }
];

const getTypeText = (type: AuditLogType): string => {
  const map: Record<AuditLogType, string> = {
    member_status_change: '成员状态变更',
    alert_resolved: '风险已处理',
    sensitive_confirmed: '敏感目录确认',
    handover_completed: '交接项处理'
  };
  return map[type] || type;
};

const AuditLogPage: React.FC = () => {
  const { auditLogs, members, folders, refreshStatistics, resetData } = useAppContext();
  const [activeTypeFilter, setActiveTypeFilter] = useState<AuditLogType | 'all'>('all');
  const [activeMemberFilter, setActiveMemberFilter] = useState<string>('all');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');

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

  const filteredLogs = useMemo(() => {
    let list = auditLogs;
    if (activeTypeFilter !== 'all') {
      list = list.filter(log => log.type === activeTypeFilter);
    }
    if (activeMemberFilter !== 'all') {
      list = list.filter(log => log.memberId === activeMemberFilter);
    }
    if (activeFolderFilter !== 'all') {
      list = list.filter(log => log.folderId === activeFolderFilter);
    }
    return list;
  }, [auditLogs, activeTypeFilter, activeMemberFilter, activeFolderFilter]);

  const memberOptions = useMemo(() => {
    const memberIds = new Set(auditLogs.filter(l => l.memberId).map(l => l.memberId as string));
    return [
      { key: 'all', label: '全部成员' },
      ...members.filter(m => memberIds.has(m.id)).map(m => ({ key: m.id, label: m.name }))
    ];
  }, [auditLogs, members]);

  const folderOptions = useMemo(() => {
    const folderIds = new Set(auditLogs.filter(l => l.folderId).map(l => l.folderId as string));
    return [
      { key: 'all', label: '全部文件夹' },
      ...folders.filter(f => folderIds.has(f.id)).map(f => ({ key: f.id, label: f.name }))
    ];
  }, [auditLogs, folders]);

  const handleReset = () => {
    Taro.showModal({
      title: '重置数据',
      content: '确定要重置所有数据吗？此操作将清空所有修改记录、风险处理和操作台账。',
      success: (res) => {
        if (res.confirm) {
          resetData();
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>处理台账</Text>
        <Text className={styles.pageDesc}>记录所有权限审计相关操作，按时间倒序排列</Text>
      </View>

      <View className={styles.filterBar}>
        <View className={styles.filterSection}>
          <Text className={styles.filterLabel}>操作类型</Text>
          <View className={styles.filterRow}>
            {typeFilters.map(filter => (
              <View
                key={filter.key}
                className={classnames(styles.filterItem, activeTypeFilter === filter.key && styles.active)}
                onClick={() => setActiveTypeFilter(filter.key)}
              >
                <Text>{filter.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {memberOptions.length > 1 && (
          <View className={styles.filterSection}>
            <Text className={styles.filterLabel}>关联成员</Text>
            <View className={styles.filterRow}>
              {memberOptions.map(opt => (
                <View
                  key={opt.key}
                  className={classnames(styles.filterItem, activeMemberFilter === opt.key && styles.active)}
                  onClick={() => setActiveMemberFilter(opt.key)}
                >
                  <Text>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {folderOptions.length > 1 && (
          <View className={styles.filterSection}>
            <Text className={styles.filterLabel}>关联文件夹</Text>
            <View className={styles.filterRow}>
              {folderOptions.map(opt => (
                <View
                  key={opt.key}
                  className={classnames(styles.filterItem, activeFolderFilter === opt.key && styles.active)}
                  onClick={() => setActiveFolderFilter(opt.key)}
                >
                  <Text>{opt.label.length > 10 ? opt.label.substring(0, 10) + '...' : opt.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.content}>
        {filteredLogs.length > 0 ? (
          <View className={styles.logList}>
            {filteredLogs.map(log => (
              <View key={log.id} className={styles.logCard}>
                <View className={styles.logHeader}>
                  <Text className={classnames(styles.logType, styles[log.type])}>
                    {getTypeText(log.type)}
                  </Text>
                  <Text className={styles.logDate}>{log.createdAt}</Text>
                </View>
                <Text className={styles.logTitle}>{log.title}</Text>
                <Text className={styles.logDescription}>{log.description}</Text>

                <View className={styles.logMeta}>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaLabel}>操作人：</Text>
                    <Text className={styles.metaValue}>{log.operatorName}</Text>
                  </View>

                  {log.oldValue && log.newValue && (
                    <View className={styles.metaChange}>
                      <Text className={styles.oldValue}>{log.oldValue}</Text>
                      <Text className={styles.arrow}>→</Text>
                      <Text className={styles.newValue}>{log.newValue}</Text>
                    </View>
                  )}

                  {log.memberName && (
                    <View className={styles.metaItem}>
                      <Text className={styles.metaLabel}>成员：</Text>
                      <Text className={styles.metaValue}>{log.memberName}</Text>
                    </View>
                  )}

                  {log.folderName && (
                    <View className={styles.metaItem}>
                      <Text className={styles.metaLabel}>文件夹：</Text>
                      <Text className={styles.metaValue}>
                        {log.folderName.length > 12 ? log.folderName.substring(0, 12) + '...' : log.folderName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>暂无操作记录</Text>
          </View>
        )}

        {filteredLogs.length > 0 && (
          <View style={{ marginTop: '40rpx', textAlign: 'center' }}>
            <Text
              style={{ fontSize: '24rpx', color: '#86909C' }}
              onClick={handleReset}
            >
              重置所有数据
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AuditLogPage;
