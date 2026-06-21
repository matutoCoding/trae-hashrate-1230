import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Member, Folder, Alert, HandoverItem, Statistics } from '@/types';
import { members } from '@/data/members';
import { folders } from '@/data/folders';
import { alerts as initialAlerts } from '@/data/alerts';
import { handoverItems as initialHandoverItems } from '@/data/handover';
import { checkPermissionRisk } from '@/utils/permission';

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
  getFolderById: (id: string) => Folder | undefined;
  getMemberById: (id: string) => Member | undefined;
  refreshStatistics: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [membersList, setMembersList] = useState<Member[]>(members);
  const [foldersList, setFoldersList] = useState<Folder[]>(folders);
  const [alertsList, setAlertsList] = useState<Alert[]>(initialAlerts);
  const [handoverList, setHandoverList] = useState<HandoverItem[]>(initialHandoverItems);
  const [statistics, setStatistics] = useState<Statistics>({
    totalFolders: 0,
    totalMembers: 0,
    activeAlerts: 0,
    pendingHandover: 0,
    graduatedWithAccess: 0,
    sensitiveFolders: 0
  });

  const currentUser = membersList.find(m => m.role === 'supervisor') || membersList[0];

  const calculateStatistics = useCallback(() => {
    let graduatedWithAccess = 0;
    let sensitiveFolders = 0;

    foldersList.forEach(folder => {
      if (folder.isSensitive) sensitiveFolders++;
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

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  const updateMemberStatus = useCallback((memberId: string, status: Member['status']) => {
    setMembersList(prev =>
      prev.map(m =>
        m.id === memberId ? { ...m, status } : m
      )
    );
    console.log('[AppContext] Member status updated', { memberId, status });
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlertsList(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, isResolved: true } : a
      )
    );
    console.log('[AppContext] Alert resolved', { alertId });
  }, []);

  const updateHandoverStatus = useCallback((itemId: string, status: HandoverItem['status']) => {
    setHandoverList(prev =>
      prev.map(h =>
        h.id === itemId ? { ...h, status } : h
      )
    );
    console.log('[AppContext] Handover status updated', { itemId, status });
  }, []);

  const getFolderById = useCallback((id: string) => {
    return foldersList.find(f => f.id === id);
  }, [foldersList]);

  const getMemberById = useCallback((id: string) => {
    return membersList.find(m => m.id === id);
  }, [membersList]);

  const refreshStatistics = useCallback(() => {
    calculateStatistics();
  }, [calculateStatistics]);

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
        getFolderById,
        getMemberById,
        refreshStatistics
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
