export const ADMIN_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  SESSION_NOT_FOUND: 'Session not found',
  SESSION_DOES_NOT_BELONG_TO_USER: 'Session does not belong to this user',
  SESSION_ALREADY_REVOKED: 'Session is already revoked',
  SESSION_REVOKED: 'Session revoked successfully',
  CANNOT_BAN_SELF: 'You cannot ban yourself',
  CANNOT_REVOKE_OWN_SESSION:
    'You cannot revoke your own active session from the admin panel',
  CANNOT_CHANGE_OWN_ROLE: 'You cannot change your own role',
  ROLE_CHANGED_SUCCESS: 'User role updated successfully',
} as const;
