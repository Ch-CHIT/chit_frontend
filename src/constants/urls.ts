const DEFAULT_URL = '/api/v1';

export const VIEWER_URLS = {
  callbackUrl: '/sign-up',
};

export const STREAMER_URLS = {
  callbackUrl: '/streamer/sign-up',
};
export const AUTH_URLS = {
  login: DEFAULT_URL + '/oauth2/login',
};

export const SESSION_URLS = {
  contentsSession: DEFAULT_URL + '/contents/session',
  contentsParticipants: DEFAULT_URL + '/contents/participants',
};
