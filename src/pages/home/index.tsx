import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import FolderCard from '@/components/FolderCard';
import type { FolderCategory } from '@/types';
import { getCategoryText } from '@/utils/permission';

const roleTextMap: Record<string, string> = {
  supervisor: '导师',
  secretary: '课题秘书',
  student: '研究生',
  collaborator: '合作者'
};

const categories: { key: FolderCategory; label: string; icon: string }[] = [
  { key: 'paper', label: '论文资料', icon: '📄' },
  { key: 'experiment', label: '实验数据', icon: '🔬' },
  { key: 'fund', label: '经费材料', icon: '💰' },
  { key: 'graduation', label: '毕业交接', icon: '🎓' }
];

const HomePage: React.FC = () => {
  const { currentUser, folders, statistics, refreshStatistics } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<FolderCategory>('paper');

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

  const filteredFolders = useMemo(() => {
    return folders.filter(f => f.category === activeCategory);
  }, [folders, activeCategory]);

  const handleGoToAlerts = () => {
    Taro.switchTab({
      url: '/pages/alerts/index'
    });
    console.log('[HomePage] Navigate to alerts page');
  };

  const handleCategoryChange = (category: FolderCategory) => {
    setActiveCategory(category);
    console.log('[HomePage] Category changed', { category });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
          <View className={styles.userText}>
            <Text className={styles.welcome}>欢迎回来</Text>
            <View className={styles.name}>
              <Text>{currentUser.name}</Text>
              <Text className={styles.roleTag}>{roleTextMap[currentUser.role]}</Text>
            </View>
          </View>
        </View>

        <ScrollView className={styles.statScroll} scrollX enableFlex>
          <View className={styles.statContainer}>
            <View className={styles.statCard}>
              <View className={styles.icon}>📁</View>
              <Text className={styles.value}>{statistics.totalFolders}</Text>
              <Text className={styles.label}>共享文件夹</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.icon}>👥</View>
              <Text className={styles.value}>{statistics.totalMembers}</Text>
              <Text className={styles.label}>成员总数</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.icon}>⚠️</View>
              <Text className={styles.value}>{statistics.activeAlerts}</Text>
              <Text className={styles.label}>待处理风险</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.icon}>📋</View>
              <Text className={styles.value}>{statistics.pendingHandover}</Text>
              <Text className={styles.label}>待交接项</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View className={styles.content}>
        {statistics.activeAlerts > 0 && (
          <View className={styles.alertBanner} onClick={handleGoToAlerts}>
            <View className={styles.alertInfo}>
              <View className={styles.alertIcon}>🚨</View>
              <View className={styles.alertText}>
                <Text className={styles.title}>发现 {statistics.activeAlerts} 项风险</Text>
                <Text className={styles.desc}>其中高风险 {statistics.graduatedWithAccess} 项需及时处理</Text>
              </View>
            </View>
            <Button className={styles.alertBtn}>立即处理</Button>
          </View>
        )}

        <View className={styles.categoryTabs}>
          {categories.map(cat => (
            <View
              key={cat.key}
              className={classnames(styles.tabItem, activeCategory === cat.key && styles.active)}
              onClick={() => handleCategoryChange(cat.key)}
            >
              <Text>{cat.icon} {cat.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.sectionTitle}>
          <Text>{getCategoryText(activeCategory)}</Text>
          <Text className={styles.more}>共 {filteredFolders.length} 个</Text>
        </View>

        {filteredFolders.length > 0 ? (
          filteredFolders.map(folder => (
            <FolderCard key={folder.id} folder={folder} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📭</Text>
            <Text className={styles.text}>暂无文件夹</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePage;
