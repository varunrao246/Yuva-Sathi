import { Commitment, ExpenseCategory, RecurrenceType } from '@/types';

/**
 * Formats a commitment's due date into Indian/English full readable date (e.g., '5 December 2026').
 */
export function formatCommitmentDueDate(dueDate?: string, dueDay?: number): string {
  if (dueDate && dueDate.trim()) {
    const parts = dueDate.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day)) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dueDate);
    if (!isNaN(d.getTime())) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }

  if (dueDay !== undefined && dueDay >= 1 && dueDay <= 31) {
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${dueDay} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  return 'No due date';
}

/**
 * Checks whether a commitment is past its due date and remains unpaid.
 */
export function isCommitmentOverdue(
  commitment: { dueDate?: string; dueDay?: number; isPaid: boolean },
  refDate?: Date
): boolean {
  if (commitment.isPaid) return false;
  const now = refDate || new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (commitment.dueDate && commitment.dueDate.trim().length >= 10) {
    return commitment.dueDate.trim() < todayStr;
  }

  if (commitment.dueDay !== undefined) {
    return commitment.dueDay < now.getDate();
  }

  return false;
}

/**
 * Extracts a numeric due day (1-31) from a YYYY-MM-DD date string.
 */
export function extractDueDayFromDate(dateStr?: string, fallbackDay: number = 1): number {
  if (!dateStr) return Math.min(31, Math.max(1, fallbackDay));
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const parsed = parseInt(parts[2], 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) {
      return parsed;
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.getDate();
  }
  return Math.min(31, Math.max(1, fallbackDay));
}

/**
 * Validates a commitment before creation or update.
 */
export function validateCommitmentInput(data: {
  name?: string;
  amount?: number | string;
  dueDate?: string;
}): { isValid: boolean; error?: string } {
  if (!data.name || !data.name.trim()) {
    return { isValid: false, error: 'Commitment name is required' };
  }

  const amt = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (amt === undefined || isNaN(amt) || amt <= 0) {
    return { isValid: false, error: 'Amount must be greater than ₹0' };
  }

  if (!data.dueDate || !data.dueDate.trim()) {
    return { isValid: false, error: 'Due date is required' };
  }

  const dateParts = data.dueDate.trim().split('-');
  if (dateParts.length !== 3 || isNaN(new Date(data.dueDate).getTime())) {
    return { isValid: false, error: 'Please select a valid date' };
  }

  return { isValid: true };
}
