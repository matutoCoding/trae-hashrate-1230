import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getStatusText, getSeverityText, getHandoverTypeText } from '@/utils/permission';

interface StatusTagProps {
  type: 'status' | 'severity' | 'handover' | 'sensitive';
  value: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type, value }) => {
  const getText = () => {
    switch (type) {
      case 'status':
        return getStatusText(value as any);
      case 'severity':
        return getSeverityText(value);
      case 'handover':
        return getHandoverTypeText(value);
      case 'sensitive':
        return '敏感目录';
      default:
        return value;
    }
  };

  return (
    <View className={classnames(styles.tag, styles[value])}>
      <Text>{getText()}</Text>
    </View>
  );
};

export default StatusTag;
