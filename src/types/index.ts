export type MemberStatus = 'studying' | 'graduated' | 'collaboration_ended' | 'external';

export type MemberRole = 'supervisor' | 'secretary' | 'student' | 'collaborator';

export type PermissionLevel = 'read' | 'edit' | 'admin';

export type FolderCategory = 'paper' | 'experiment' | 'fund' | 'graduation';

export type AlertType = 'graduated_edit' | 'sensitive_folder' | 'expired_access';

export type HandoverStatus = 'pending' | 'confirmed' | 'completed';

export type HandoverType = 'transfer' | 'revoke' | 'supervisor_confirm';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  department: string;
  email: string;
  joinDate: string;
  endDate?: string;
  avatar: string;
}

export interface FolderPermission {
  memberId: string;
  memberName: string;
  memberStatus: MemberStatus;
  permission: PermissionLevel;
  grantedAt: string;
  grantedBy: string;
}

export interface SensitiveConfirmation {
  confirmedBy: string;
  confirmedByName: string;
  confirmedAt: string;
  sharedMembers: string[];
  notes?: string;
}

export interface Folder {
  id: string;
  name: string;
  category: FolderCategory;
  path: string;
  description: string;
  isSensitive: boolean;
  sensitiveConfirmed?: SensitiveConfirmation;
  fileCount: number;
  size: string;
  updatedAt: string;
  permissions: FolderPermission[];
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  folderId?: string;
  folderName?: string;
  memberId?: string;
  memberName?: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
  isResolved: boolean;
  isSensitiveConfirmed?: boolean;
}

export interface HandoverItem {
  id: string;
  type: HandoverType;
  title: string;
  description: string;
  folderId?: string;
  folderName?: string;
  memberId?: string;
  memberName?: string;
  targetMemberId?: string;
  targetMemberName?: string;
  permission?: string;
  status: HandoverStatus;
  dueDate: string;
  notes?: string;
  updatedAt?: string;
}

export interface HandoverReport {
  semester: string;
  generatedAt: string;
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    transfer: number;
    revoke: number;
    supervisorConfirm: number;
  };
  items: {
    transfer: HandoverItem[];
    revoke: HandoverItem[];
    supervisorConfirm: HandoverItem[];
  };
}

export type AuditLogType =
  | 'member_status_change'
  | 'alert_resolved'
  | 'sensitive_confirmed'
  | 'handover_completed';

export interface AuditLog {
  id: string;
  type: AuditLogType;
  title: string;
  description: string;
  operatorId: string;
  operatorName: string;
  memberId?: string;
  memberName?: string;
  folderId?: string;
  folderName?: string;
  handoverId?: string;
  alertId?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Statistics {
  totalFolders: number;
  totalMembers: number;
  activeAlerts: number;
  pendingHandover: number;
  graduatedWithAccess: number;
  sensitiveFolders: number;
}
