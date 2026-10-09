/**
 * QuickFix Status and Priority Utilities
 * Standardizes ticket statuses, priorities, badges, and formatting across the application.
 */

export const TICKET_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

/**
 * Returns visual styling configuration for a given ticket status
 * @param {string} status 
 * @returns {object} status styling config
 */
export function getStatusConfig(status) {
  const normalized = (status || '').trim().toLowerCase();

  switch (normalized) {
    case 'pending':
      return {
        label: TICKET_STATUS.PENDING,
        bg: 'bg-[#FFF0D7]',
        text: 'text-[#9A3412]',
        border: 'border-[#FED7AA]',
        dotColor: 'bg-[#F97316]',
        badgeClasses: 'bg-[#FFF0D7] text-[#9A3412] border border-[#FED7AA]',
      };

    case 'in progress':
    case 'inprogress':
    case 'in_progress':
      return {
        label: TICKET_STATUS.IN_PROGRESS,
        bg: 'bg-[#E0ECFD]',
        text: 'text-[#1D4ED8]',
        border: 'border-[#BFDBFE]',
        dotColor: 'bg-[#2F6FED]',
        badgeClasses: 'bg-[#E0ECFD] text-[#1D4ED8] border border-[#BFDBFE]',
      };

    case 'resolved':
      return {
        label: TICKET_STATUS.RESOLVED,
        bg: 'bg-[#DDF5E5]',
        text: 'text-[#166534]',
        border: 'border-[#BBF7D0]',
        dotColor: 'bg-[#16A34A]',
        badgeClasses: 'bg-[#DDF5E5] text-[#166534] border border-[#BBF7D0]',
      };

    case 'escalated':
      return {
        label: TICKET_STATUS.ESCALATED,
        bg: 'bg-[#FCE8E8]',
        text: 'text-[#991B1B]',
        border: 'border-[#FECACA]',
        dotColor: 'bg-[#DC2626]',
        badgeClasses: 'bg-[#FCE8E8] text-[#991B1B] border border-[#FECACA]',
      };

    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dotColor: 'bg-slate-400',
        badgeClasses: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
  }
}

/**
 * Returns visual styling configuration for a given ticket priority
 * @param {string} priority 
 * @returns {object} priority styling config
 */
export function getPriorityConfig(priority) {
  const normalized = (priority || '').trim().toLowerCase();

  switch (normalized) {
    case 'low':
      return {
        label: TICKET_PRIORITY.LOW,
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badgeClasses: 'bg-slate-100 text-slate-700 border border-slate-200',
      };

    case 'medium':
      return {
        label: TICKET_PRIORITY.MEDIUM,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badgeClasses: 'bg-blue-50 text-blue-700 border border-blue-200',
      };

    case 'high':
      return {
        label: TICKET_PRIORITY.HIGH,
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badgeClasses: 'bg-amber-50 text-amber-800 border border-amber-200',
      };

    case 'critical':
      return {
        label: TICKET_PRIORITY.CRITICAL,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badgeClasses: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
      };

    default:
      return {
        label: priority || 'Normal',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badgeClasses: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
  }
}
