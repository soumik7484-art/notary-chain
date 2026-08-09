export const ROLES = { ADMIN: 'admin', COMPANY: 'company', BANK: 'bank', NOTARY: 'notary' };

export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  PENDING_VERIFICATION: 'pending_verification',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NOTARIZED: 'notarized'
};

export const STATUS_COLORS = {
  [DOCUMENT_STATUS.DRAFT]: 'bg-stone-500',
  [DOCUMENT_STATUS.PENDING_VERIFICATION]: 'bg-amber-500',
  [DOCUMENT_STATUS.UNDER_REVIEW]: 'bg-emerald-600',
  [DOCUMENT_STATUS.APPROVED]: 'bg-emerald-500',
  [DOCUMENT_STATUS.REJECTED]: 'bg-rose-500',
  [DOCUMENT_STATUS.NOTARIZED]: 'bg-emerald-700'
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-stone-700',
  [ROLES.COMPANY]: 'bg-emerald-600',
  [ROLES.BANK]: 'bg-emerald-500',
  [ROLES.NOTARY]: 'bg-emerald-800'
};

export const SIDEBAR_MENUS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard',        path: '/dashboard',         icon: 'FiHome'       },
    { label: 'Polygon Neobank',  path: '/neobank',           icon: 'FiCreditCard'  },
    { label: 'Users',            path: '/admin/users',       icon: 'FiUsers'       },
    { label: 'Audit Logs',       path: '/admin/audit',       icon: 'FiActivity'    },
    { label: 'Analytics',        path: '/admin/analytics',   icon: 'FiPieChart'    },
    { label: 'Wallet Health',    path: '/blockchain-health', icon: 'FiHexagon'     }
  ],
  DEFAULT: [
    { label: 'Dashboard',        path: '/dashboard',         icon: 'FiHome'        },
    { label: 'Polygon Neobank',  path: '/neobank',           icon: 'FiCreditCard'  },
    { label: 'Documents',        path: '/documents',         icon: 'FiFileText'    },
    { label: 'Verifications',    path: '/verifications',     icon: 'FiCheckCircle' },
    { label: 'Wallet Health',    path: '/blockchain-health', icon: 'FiHexagon'     },
    { label: 'Profile',          path: '/profile',           icon: 'FiUser'        },
    { label: 'Settings',         path: '/settings',          icon: 'FiSettings'    }
  ]
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  DOCUMENTS: '/documents'
};

export const FREIGHTER_TESTNET_WALLET = 'GBT73LMEDNGASAHFDULIEINFWZVLWTPJVK6Q3OEGGW6G54AHENA3JLDA';
