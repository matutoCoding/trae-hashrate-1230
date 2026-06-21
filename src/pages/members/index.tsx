import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import MemberCard from '@/components/MemberCard';
import type { MemberStatus } from '@/types';
import { getStatusText } from '@/utils/permission';

const statusFilters: { key: MemberStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'studying', label: '在读' },
  { key: 'graduated', label: '已毕业' },
  { key: 'collaboration_ended', label: '合作结束' },
  { key: 'external', label: '外校合作者' }
];

const MembersPage: React.FC = () => {
  const { members, refreshStatistics } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<MemberStatus | 'all'>('all');

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

  const filteredMembers = useMemo(() => {
    if (activeFilter === 'all') return members;
    return members.filter(m => m.status === activeFilter);
  }, [members, activeFilter]);

  const stats = useMemo(() => {
    return {
      studying: members.filter(m => m.status === 'studying').length,
      graduated: members.filter(m => m.status === 'graduated').length,
      collaboration_ended: members.filter(m => m.status === 'collaboration_ended').length,
      external: members.filter(m => m.status === 'external').length
    };
  }, [members]);

  const handleFilterChange = (key: MemberStatus | 'all') => {
    setActiveFilter(key);
    console.log('[MembersPage] Filter changed', { key });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>成员管理</Text>
        <ScrollView className={styles.filterScroll} scrollX enableFlex>
          <View className={styles.filterContainer}>
            {statusFilters.map(filter => (
              <View
                key={filter.key}
                className={classnames(styles.filterItem, activeFilter === filter.key && styles.active)}
                onClick={() => handleFilterChange(filter.key)}
              >
                <Text>{filter.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.content}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.value}>{stats.studying}</Text>
            <Text className={styles.label}>在读成员</Text>
          </View>
          <View className={classnames(styles.statItem, styles.warning)}>
            <Text className={styles.value}>{stats.graduated}</Text>
            <Text className={styles.label}>已毕业</Text>
          </View>
          <View className={classnames(styles.statItem, styles.danger)}>
            <Text className={styles.value}>{stats.collaboration_ended}</Text>
            <Text className={styles.label}>合作结束</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.value}>{stats.external}</Text>
            <Text className={styles.label}>外校合作</Text>
          </View>
        </View>

        <View className={styles.listTitle}>
          <Text>{activeFilter === 'all' ? '全部成员' : getStatusText(activeFilter)}</Text>
          <Text className={styles.count}>共 {filteredMembers.length} 人</Text>
        </View>

        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>👥</Text>
            <Text className={styles.text}>暂无成员</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MembersPage;
