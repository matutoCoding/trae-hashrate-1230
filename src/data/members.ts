import type { Member } from '@/types';

export const members: Member[] = [
  {
    id: 'm001',
    name: '张教授',
    role: 'supervisor',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'zhang@university.edu.cn',
    joinDate: '2018-09-01',
    avatar: 'https://picsum.photos/id/1005/200/200'
  },
  {
    id: 'm002',
    name: '李秘书',
    role: 'secretary',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'li@university.edu.cn',
    joinDate: '2020-03-15',
    avatar: 'https://picsum.photos/id/1011/200/200'
  },
  {
    id: 'm003',
    name: '王小明',
    role: 'student',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'wangxm@university.edu.cn',
    joinDate: '2022-09-01',
    avatar: 'https://picsum.photos/id/1012/200/200'
  },
  {
    id: 'm004',
    name: '刘思琪',
    role: 'student',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'liusk@university.edu.cn',
    joinDate: '2023-09-01',
    avatar: 'https://picsum.photos/id/1014/200/200'
  },
  {
    id: 'm005',
    name: '陈浩然',
    role: 'student',
    status: 'graduated',
    department: '计算机科学与技术学院',
    email: 'chenhr@university.edu.cn',
    joinDate: '2020-09-01',
    endDate: '2024-06-30',
    avatar: 'https://picsum.photos/id/1025/200/200'
  },
  {
    id: 'm006',
    name: '赵雨晴',
    role: 'student',
    status: 'graduated',
    department: '计算机科学与技术学院',
    email: 'zhaoyq@university.edu.cn',
    joinDate: '2019-09-01',
    endDate: '2023-06-30',
    avatar: 'https://picsum.photos/id/1027/200/200'
  },
  {
    id: 'm007',
    name: '黄博士',
    role: 'collaborator',
    status: 'external',
    department: '清华大学',
    email: 'huang@tsinghua.edu.cn',
    joinDate: '2023-01-10',
    avatar: 'https://picsum.photos/id/1033/200/200'
  },
  {
    id: 'm008',
    name: '周研究员',
    role: 'collaborator',
    status: 'collaboration_ended',
    department: '北京大学',
    email: 'zhou@pku.edu.cn',
    joinDate: '2021-05-20',
    endDate: '2024-01-15',
    avatar: 'https://picsum.photos/id/1062/200/200'
  },
  {
    id: 'm009',
    name: '孙伟',
    role: 'student',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'sunw@university.edu.cn',
    joinDate: '2021-09-01',
    avatar: 'https://picsum.photos/id/1074/200/200'
  },
  {
    id: 'm010',
    name: '林晓彤',
    role: 'student',
    status: 'studying',
    department: '计算机科学与技术学院',
    email: 'linxt@university.edu.cn',
    joinDate: '2022-09-01',
    avatar: 'https://picsum.photos/id/1079/200/200'
  }
];

export const getMemberById = (id: string): Member | undefined => {
  return members.find(m => m.id === id);
};
