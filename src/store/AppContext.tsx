import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { Member, Folder, Alert, HandoverItem, Statistics, SensitiveConfirmation, AuditLog, AuditLogType } from '@/types';
import { members as initialMembers } from '@/data/members';
import { folders as initialFolders } from '@/data/folders';
import { alerts as initialAlerts } from '@/data/alerts';
import { handoverItems as initialHandoverItems } from '@/data/handover';
import { checkPermissionRisk, isSensitiveFolder } from '@/utils/permission';

const STORAGE_KEYS = {
  MEMBERS: 'permission_audit_members',
  FOLDERS: 'permission_audit_folders',
  ALERTS: 'permission_audit_alerts',
  HANDOVER: 'permission_audit_handover',
  AUDIT_LOGS: 'permission_audit_logs'
};

const getStatusText = (status: Member['status']): string => {
  const map: Record<Member['status'], string> = {
    studying: '在读',
    graduated: '已毕业',
    collaboration_ended: '合作结束',
    external: '外校合作者'
  };
  return map[status] || status;
};

const getHandoverStatusText = (status: HandoverItem['status']): string => {
  const map: Record<HandoverItem['status'], string> = {
    pending: '待处理',
    confirmed: '进行中',
    completed: '已完成'
  };
  return map[status] || status;
};

interface AppContextType {
  currentUser: Member;
  members: Member[];
  folders: Folder[];
  alerts: Alert[];
  handoverItems: HandoverItem[];
  auditLogs: AuditLog[];
  statistics: Statistics;
  updateMemberStatus: (memberId: string, status: Member['status']) => void;
  resolveAlert: (alertId: string) => void;
  updateHandoverStatus: (itemId: string, status: HandoverItem['status']) => void;
  confirmSensitiveFolder: (folderId: string, confirmation: SensitiveConfirmation) => void;
  getFolderById: (id: string) => Folder | undefined;
  getMemberById: (id: string) => Member | undefined;
  refreshStatistics: () => void;
  recalculateAllRisks: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = Taro.getStorageSync(key);
    if (stored) {
      console.log(`[AppContext] Loaded ${key} from storage`);
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`[AppContext] Failed to load ${key} from storage:`, e);
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
    console.log(`[AppContext] Saved ${key} to storage`);
  } catch (e) {
    console.warn(`[AppContext] Failed to save ${key} to storage:`, e);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [membersList, setMembersList] = useState<Member[]>(() =>
    loadFromStorage(STORAGE_KEYS.MEMBERS, initialMembers)
  );
  const [foldersList, setFoldersList] = useState<Folder[]>(() =>
    loadFromStorage(STORAGE_KEYS.FOLDERS, initialFolders)
  );
  const [alertsList, setAlertsList] = useState<Alert[]>(() =>
    loadFromStorage(STORAGE_KEYS.ALERTS, initialAlerts)
  );
  const [handoverList, setHandoverList] = useState<HandoverItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.HANDOVER, initialHandoverItems)
  );
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, [])
  );
  const [statistics, setStatistics] = useState<Statistics>({
    totalFolders: 0,
    totalMembers: 0,
    activeAlerts: 0,
    pendingHandover: 0,
    graduatedWithAccess: 0,
    sensitiveFolders: 0
  });

  const currentUser = membersList.find(m => m.role === 'supervisor') || membersList[0];

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'createdAt' | 'operatorId' | 'operatorName'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0],
      operatorId: currentUser.id,
      operatorName: currentUser.name
    };
    setAuditLogsList(prev => [newLog, ...prev]);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...auditLogsList]);
  }, [currentUser, auditLogsList]);

  const syncFolderPermissionsWithMembers = useCallback((folders: Folder[], members: Member[]): Folder[] => {
    return folders.map(folder => ({
      ...folder,
      isSensitive: isSensitiveFolder(folder.name),
      permissions: folder.permissions.map(perm => {
        const member = members.find(m => m.id === perm.memberId);
        if (member) {
          return {
            ...perm,
            memberName: member.name,
            memberStatus: member.status
          };
        }
        return perm;
      })
    }));
  }, []);

  const generateAlertsFromFolders = useCallback((folders: Folder[], existingAlerts: Alert[]): Alert[] => {
    const newAlerts: Alert[] = [];
    let alertIdCounter = existingAlerts.length + 1;

    folders.forEach(folder => {
      folder.permissions.forEach(perm => {
        const isRisk =
          (perm.memberStatus === 'graduated' && perm.permission === 'edit') ||
          (perm.memberStatus === 'collaboration_ended' && perm.permission !== 'read');

        if (isRisk) {
          const statusText = perm.memberStatus === 'graduated' ? '已毕业' : '合作结束';
          const permText = perm.permission === 'edit' ? '编辑' : perm.permission === 'admin' ? '管理' : '读取';
          const detail = `${perm.memberName}（${statusText}）仍拥有${permText}权限`;

          const existingAlert = existingAlerts.find(
            a => a.folderId === folder.id &&
              a.memberId === perm.memberId &&
              a.type === 'graduated_edit' &&
              !a.isResolved
          );

          if (!existingAlert) {
            newAlerts.push({
              id: `alert_${Date.now()}_${alertIdCounter++}`,
              type: 'graduated_edit',
              title: `${perm.memberName}仍拥有编辑权限`,
              description: `${perm.memberName}（${statusText}）仍对"${folder.name}"拥有${permText}权限，请及时处理`,
              folderId: folder.id,
              folderName: folder.name,
              memberId: perm.memberId,
              memberName: perm.memberName,
              severity: perm.memberStatus === 'graduated' ? 'high' : 'medium',
              createdAt: new Date().toISOString().split('T')[0],
              isResolved: false
            });
          }
        }
      });

      if (folder.isSensitive && !folder.sensitiveConfirmed) {
        const existingAlert = existingAlerts.find(
          a => a.folderId === folder.id &&
            a.type === 'sensitive_folder' &&
            !a.isResolved
        );

        if (!existingAlert) {
          newAlerts.push({
            id: `alert_${Date.now()}_${alertIdCounter++}`,
            type: 'sensitive_folder',
            title: `敏感目录"${folder.name}"需确认共享范围`,
            description: '该目录包含敏感信息，请确认当前共享成员是否合适',
            folderId: folder.id,
            folderName: folder.name,
            severity: 'high',
            createdAt: new Date().toISOString().split('T')[0],
            isResolved: false,
            isSensitiveConfirmed: false
          });
        }
      }
    });

    const resolvedAlerts = existingAlerts.map(alert => {
      if (alert.type === 'graduated_edit' && alert.folderId && alert.memberId && !alert.isResolved) {
        const folder = folders.find(f => f.id === alert.folderId);
        const perm = folder?.permissions.find(p => p.memberId === alert.memberId);
        if (perm) {
          const riskCheck = checkPermissionRisk([perm]);
          if (!riskCheck.hasRisk) {
            return { ...alert, isResolved: true };
          }
        }
      }
      if (alert.type === 'sensitive_folder' && alert.folderId && !alert.isResolved) {
        const folder = folders.find(f => f.id === alert.folderId);
        if (folder?.sensitiveConfirmed) {
          return { ...alert, isResolved: false, isSensitiveConfirmed: true };
        }
      }
      return alert;
    });

    return [...resolvedAlerts, ...newAlerts];
  }, []);

  const calculateStatistics = useCallback(() => {
    let graduatedWithAccess = 0;
    let sensitiveFolders = 0;
    let unconfirmedSensitive = 0;

    foldersList.forEach(folder => {
      if (folder.isSensitive) {
        sensitiveFolders++;
        if (!folder.sensitiveConfirmed) {
          unconfirmedSensitive++;
        }
      }
      const riskCheck = checkPermissionRisk(folder.permissions);
      if (riskCheck.hasRisk) {
        graduatedWithAccess += riskCheck.riskCount;
      }
    });

    setStatistics({
      totalFolders: foldersList.length,
      totalMembers: membersList.length,
      activeAlerts: alertsList.filter(a => !a.isResolved).length,
      pendingHandover: handoverList.filter(h => h.status === 'pending').length,
      graduatedWithAccess,
      sensitiveFolders
    });
  }, [foldersList, membersList, alertsList, handoverList]);

  const recalculateAllRisks = useCallback(() => {
    console.log('[AppContext] Recalculating all risks...');

    const updatedFolders = syncFolderPermissionsWithMembers(foldersList, membersList);
    setFoldersList(updatedFolders);
    saveToStorage(STORAGE_KEYS.FOLDERS, updatedFolders);

    const updatedAlerts = generateAlertsFromFolders(updatedFolders, alertsList);
    setAlertsList(updatedAlerts);
    saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);

    calculateStatistics();
  }, [foldersList, membersList, alertsList, syncFolderPermissionsWithMembers, generateAlertsFromFolders, calculateStatistics]);

  useEffect(() => {
    const updatedFolders = syncFolderPermissionsWithMembers(foldersList, membersList);
    if (JSON.stringify(updatedFolders) !== JSON.stringify(foldersList)) {
      setFoldersList(updatedFolders);
      saveToStorage(STORAGE_KEYS.FOLDERS, updatedFolders);
    }

    const updatedAlerts = generateAlertsFromFolders(updatedFolders, alertsList);
    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alertsList)) {
      setAlertsList(updatedAlerts);
      saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);
    }

    calculateStatistics();
  }, [membersList]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEMBERS, membersList);
  }, [membersList]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HANDOVER, handoverList);
  }, [handoverList]);

  const updateMemberStatus = useCallback((memberId: string, status: Member['status']) => {
    console.log('[AppContext] Updating member status', { memberId, status });
    const oldMember = membersList.find(m => m.id === memberId);

    const updatedMembers = membersList.map(m =>
      m.id === memberId ? { ...m, status, endDate: status !== 'studying' ? new Date().toISOString().split('T')[0] : undefined } : m
    );
    setMembersList(updatedMembers);

    const updatedFolders = syncFolderPermissionsWithMembers(foldersList, updatedMembers);
    setFoldersList(updatedFolders);
    saveToStorage(STORAGE_KEYS.FOLDERS, updatedFolders);

    const updatedAlerts = generateAlertsFromFolders(updatedFolders, alertsList);
    setAlertsList(updatedAlerts);
    saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);

    if (oldMember && oldMember.status !== status) {
      addAuditLog({
        type: 'member_status_change',
        title: `成员状态变更：${oldMember.name}`,
        description: `${oldMember.name}的状态从${getStatusText(oldMember.status)}变更为${getStatusText(status)}`,
        memberId,
        memberName: oldMember.name,
        oldValue: getStatusText(oldMember.status),
        newValue: getStatusText(status)
      });
    }

    Taro.showToast({
      title: '状态已更新',
      icon: 'success'
    });

    setTimeout(() => calculateStatistics(), 100);
  }, [membersList, foldersList, alertsList, syncFolderPermissionsWithMembers, generateAlertsFromFolders, calculateStatistics, addAuditLog]);

  const resolveAlert = useCallback((alertId: string) => {
    console.log('[AppContext] Resolving alert', { alertId });
    const oldAlert = alertsList.find(a => a.id === alertId);
    const updatedAlerts = alertsList.map(a =>
      a.id === alertId ? { ...a, isResolved: true } : a
    );
    setAlertsList(updatedAlerts);
    saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);

    if (oldAlert && !oldAlert.isResolved) {
      addAuditLog({
        type: 'alert_resolved',
        title: `风险已处理：${oldAlert.title}`,
        description: `风险预警「${oldAlert.title}」已标记为已处理`,
        alertId,
        folderId: oldAlert.folderId,
        folderName: oldAlert.folderName,
        memberId: oldAlert.memberId,
        memberName: oldAlert.memberName,
        oldValue: '待处理',
        newValue: '已处理'
      });
    }

    calculateStatistics();
  }, [alertsList, calculateStatistics, addAuditLog]);

  const updateHandoverStatus = useCallback((itemId: string, status: HandoverItem['status']) => {
    console.log('[AppContext] Updating handover status', { itemId, status });
    const oldItem = handoverList.find(h => h.id === itemId);
    const updatedHandover = handoverList.map(h =>
      h.id === itemId ? { ...h, status, updatedAt: new Date().toISOString().split('T')[0] } : h
    );
    setHandoverList(updatedHandover);
    saveToStorage(STORAGE_KEYS.HANDOVER, updatedHandover);

    if (oldItem && oldItem.status !== status) {
      addAuditLog({
        type: 'handover_completed',
        title: `交接项状态变更：${oldItem.title}`,
        description: `交接项「${oldItem.title}」从${getHandoverStatusText(oldItem.status)}变更为${getHandoverStatusText(status)}`,
        handoverId: itemId,
        folderId: oldItem.folderId,
        folderName: oldItem.folderName,
        memberId: oldItem.memberId,
        memberName: oldItem.memberName,
        oldValue: getHandoverStatusText(oldItem.status),
        newValue: getHandoverStatusText(status)
      });
    }

    calculateStatistics();
  }, [handoverList, calculateStatistics, addAuditLog]);

  const confirmSensitiveFolder = useCallback((folderId: string, confirmation: SensitiveConfirmation) => {
    console.log('[AppContext] Confirming sensitive folder', { folderId, confirmation });
    const oldFolder = foldersList.find(f => f.id === folderId);
    const updatedFolders = foldersList.map(f =>
      f.id === folderId ? { ...f, sensitiveConfirmed: confirmation } : f
    );
    setFoldersList(updatedFolders);
    saveToStorage(STORAGE_KEYS.FOLDERS, updatedFolders);

    const updatedAlerts = alertsList.map(a =>
      a.folderId === folderId && a.type === 'sensitive_folder'
        ? { ...a, isSensitiveConfirmed: true }
        : a
    );
    setAlertsList(updatedAlerts);
    saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);

    if (oldFolder) {
      addAuditLog({
        type: 'sensitive_confirmed',
        title: `敏感目录已确认：${oldFolder.name}`,
        description: `敏感目录「${oldFolder.name}」共享范围已确认，共${confirmation.sharedMembers.length}人可访问`,
        folderId,
        folderName: oldFolder.name,
        oldValue: '未确认',
        newValue: '已确认'
      });
    }

    Taro.showToast({
      title: '确认已记录',
      icon: 'success'
    });

    calculateStatistics();
  }, [foldersList, alertsList, calculateStatistics, addAuditLog]);

  const getFolderById = useCallback((id: string) => {
    return foldersList.find(f => f.id === id);
  }, [foldersList]);

  const getMemberById = useCallback((id: string) => {
    return membersList.find(m => m.id === id);
  }, [membersList]);

  const refreshStatistics = useCallback(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  const resetData = useCallback(() => {
    console.log('[AppContext] Resetting all data to initial state');
    Taro.removeStorageSync(STORAGE_KEYS.MEMBERS);
    Taro.removeStorageSync(STORAGE_KEYS.FOLDERS);
    Taro.removeStorageSync(STORAGE_KEYS.ALERTS);
    Taro.removeStorageSync(STORAGE_KEYS.HANDOVER);
    Taro.removeStorageSync(STORAGE_KEYS.AUDIT_LOGS);
    setMembersList(initialMembers);
    setFoldersList(initialFolders);
    setAlertsList(initialAlerts);
    setHandoverList(initialHandoverItems);
    setAuditLogsList([]);
    Taro.showToast({
      title: '数据已重置',
      icon: 'success'
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        members: membersList,
        folders: foldersList,
        alerts: alertsList,
        handoverItems: handoverList,
        auditLogs: auditLogsList,
        statistics,
        updateMemberStatus,
        resolveAlert,
        updateHandoverStatus,
        confirmSensitiveFolder,
        getFolderById,
        getMemberById,
        refreshStatistics,
        recalculateAllRisks,
        resetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
