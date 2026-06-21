import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Member } from '@/types';
import StatusTag from '@/components/StatusTag';

interface MemberCardProps {
  member: Member;
  showArrow?: boolean;
}

const roleTextMap: Record<string, string> = {
  supervisor: '导师',
  secretary: '课题秘书',
  student: '研究生',
  collaborator: '合作者'
};

const MemberCard: React.FC<MemberCardProps> = ({ member, showArrow = true }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/member-detail/index?id=${member.id}`
    });
    console.log('[MemberCard] Navigate to member detail', { memberId: member.id });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{member.name}</Text>
          <Text className={styles.role}>{roleTextMap[member.role]}</Text>
          <StatusTag type="status" value={member.status} />
        </View>
        <Text className={styles.department}>{member.department}</Text>
        <Text className={styles.email}>{member.email}</Text>
      </View>
      {showArrow && <Text className={styles.arrow}>›</Text>}
    </View>
  );
};

export default MemberCard;
