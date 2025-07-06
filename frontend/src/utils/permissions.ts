import { UserRole } from '../types';
import { rolePermissions } from './mockData';

export const hasPermission = (userRole: UserRole, permission: keyof typeof rolePermissions.ADMIN): boolean => {
  return rolePermissions[userRole][permission] || false;
};

export const canEditIssue = (userRole: UserRole, issueReporterId: string, userId: string): boolean => {
  if (hasPermission(userRole, 'canEditAnyIssue')) {
    return true;
  }
  return issueReporterId === userId;
};

export const canDeleteIssue = (userRole: UserRole, issueReporterId: string, userId: string): boolean => {
  if (hasPermission(userRole, 'canDeleteAnyIssue')) {
    return true;
  }
  return userRole === 'REPORTER' && issueReporterId === userId;
};

export const canViewIssue = (userRole: UserRole, issueReporterId: string, userId: string): boolean => {
  if (hasPermission(userRole, 'canViewAllIssues')) {
    return true;
  }
  return issueReporterId === userId;
};