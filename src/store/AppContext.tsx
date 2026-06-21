import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { Member, Folder, Alert, HandoverItem, Statistics, SensitiveConfirmation } from '@/types';
import { members as initialMembers } from '@/data/members';
import { folders as initialFolders } from '@/data/folders';
import { alerts as initialAlerts } from '@/data/alerts';
import { handoverItems as initialHandoverItems } from '@/data/handover';
import { checkPermissionRisk, isSensitiveFolder } from '@/utils/permission';

const STORAGE_KEYS = {
  MEMBERS: 'permission_audit_members',
  FOLDERS: 'permission_audit_folders',
  ALERTS: 'permission_audit_alerts',
  HANDOVER: 'permission_audit_handover'
};

interface AppContextType {
  currentUser: Member;
  members: Member[];
  folders: Folder[];
  alerts: Alert[];
  handoverItems: HandoverItem[];
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
  const [statistics, setStatistics] = useState<Statistics>({
    totalFolders: 0,
    totalMembers: 0,
    activeAlerts: 0,
    pendingHandover: 0,
    graduatedWithAccess: 0,
    sensitiveFolders: 0
  });

  const currentUser = membersList.find(m => m.role === 'supervisor') || membersList[0];

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
      const riskCheck = checkPermissionRisk(folder.permissions);

      riskCheck.details.forEach((detail, idx) => {
        const perm = folder.permissions[idx];
        if (perm) {
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
              description: detail,
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

    Taro.showToast({
      title: '状态已更新',
      icon: 'success'
    });

    setTimeout(() => calculateStatistics(), 100);
  }, [membersList, foldersList, alertsList, syncFolderPermissionsWithMembers, generateAlertsFromFolders, calculateStatistics]);

  const resolveAlert = useCallback((alertId: string) => {
    console.log('[AppContext] Resolving alert', { alertId });
    const updatedAlerts = alertsList.map(a =>
      a.id === alertId ? { ...a, isResolved: true } : a
    );
    setAlertsList(updatedAlerts);
    saveToStorage(STORAGE_KEYS.ALERTS, updatedAlerts);
    calculateStatistics();
  }, [alertsList, calculateStatistics]);

  const updateHandoverStatus = useCallback((itemId: string, status: HandoverItem['status']) => {
    console.log('[AppContext] Updating handover status', { itemId, status });
    const updatedHandover = handoverList.map(h =>
      h.id === itemId ? { ...h, status, updatedAt: new Date().toISOString().split('T')[0] } : h
    );
    setHandoverList(updatedHandover);
    saveToStorage(STORAGE_KEYS.HANDOVER, updatedHandover);
    calculateStatistics();
  }, [handoverList, calculateStatistics]);

  const confirmSensitiveFolder = useCallback((folderId: string, confirmation: SensitiveConfirmation) => {
    console.log('[AppContext] Confirming sensitive folder', { folderId, confirmation });
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

    Taro.showToast({
      title: '确认已记录',
      icon: 'success'
    });

    calculateStatistics();
  }, [foldersList, alertsList, calculateStatistics]);

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
    setMembersList(initialMembers);
    setFoldersList(initialFolders);
    setAlertsList(initialAlerts);
    setHandoverList(initialHandoverItems);
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
