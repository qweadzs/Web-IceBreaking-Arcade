const CLIENT_ID = 'Jb6yH7fmEzBhClzMoClq';
const REDIRECT_URI = process.env.REACT_APP_API_ROOT_NOTV1 + '/oauth/callback/naver';

export const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&state=arcade&redirect_uri=${REDIRECT_URI}`;
