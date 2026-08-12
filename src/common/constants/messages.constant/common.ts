export const COMMON_MESSAGES = {
  INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
  STALE_AUTHORIZATION: 'Authorization state has changed',
  AUTHORIZATION_SERVICE_UNAVAILABLE:
    'Authorization service temporarily unavailable',
  FORBIDDEN: 'You do not have permission to perform this action',
  REQUEST_IN_PROGRESS:
    'This request is already being processed. Please wait a moment.',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down and try again later.',
} as const;
