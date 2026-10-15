// Single source of truth for admin demo credentials and storage keys
export const ADMIN_CREDENTIALS = {
  email: 'admin@yetaxahai.com',
  password: 'Yeta-Admin-Demo#2026',
} as const

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'yetaxahai_schema_version',
  CURRENT_VERSION: 'v2_local_only',
  USERS: 'yetaxahai_users_v2',
  SESSION: 'yetaxahai_session_v2',
  LOCKOUT: 'yetaxahai_auth_lockout_v2',
  CART: 'yetaxahai_cart_v2',
  GUEST_CART: 'yetaxahai_guest_cart_v2',
  WISHLIST: 'yetaxahai_wishlist_v2',
  ORDERS_PREFIX: 'yetaxahai_orders_v2_',
} as const
