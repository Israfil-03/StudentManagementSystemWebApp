/**
 * Format date to locale string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    STAFF: 'Staff',
  };
  return roleNames[role] || role;
};

/**
 * Get attendance status display
 */
export const getAttendanceStatusDisplay = (status) => {
  const statusMap = {
    P: { label: 'Present', color: 'success' },
    A: { label: 'Absent', color: 'danger' },
    L: { label: 'Late', color: 'warning' },
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Get fee status display
 */
export const getFeeStatusDisplay = (status) => {
  const statusMap = {
    DUE: { label: 'Due', color: 'warning' },
    PAID: { label: 'Paid', color: 'success' },
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Get student status display
 */
export const getStudentStatusDisplay = (status) => {
  const statusMap = {
    ACTIVE: { label: 'Active', color: 'success' },
    INACTIVE: { label: 'Inactive', color: 'danger' },
    GRADUATED: { label: 'Graduated', color: 'primary' },
    TRANSFERRED: { label: 'Transferred', color: 'warning' },
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Generate current academic year
 */
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // If after July, use current year - next year
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  // Otherwise use previous year - current year
  return `${year - 1}-${year}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if user has required role
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  if (typeof roles === 'string') return user.role === roles;
  return roles.includes(user.role);
};

/**
 * Check if user is admin or above
 */
export const isAdmin = (user) => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, 'SUPER_ADMIN');
};
