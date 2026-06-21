import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color = 'blue', onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={classnames(styles.iconContainer, styles[color])}>
        <Text>{icon}</Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.value}>{value}</Text>
        <Text className={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

export default StatCard;
