import { Api } from './Api';
import { getRCAppInfo } from './utils/getRCAppInfo';
import { getRCAuthorizeURL } from './utils/getRCAuthorizeURL';

const loginWithRocketChatOAuth = async (config: { api: Api }) => {
  const appInfo = await getRCAppInfo(config.api.baseUrl);
  if (!appInfo) {
    throw new Error('EmbeddedChatApp not found on server');
  }
  const { client_id, serviceName, allowedOrigins, redirect_uri } =
    appInfo.config;

  if (!client_id) {
    throw new Error(
      'client_id not found. Make sure you have configured the EmbeddedChatApp on Rocket.Chat server'
    );
  }
  if (!serviceName) {
    throw new Error(
      'custom_oauth_name not found. Make sure you have configured the EmbeddedChatApp on Rocket.Chat server'
    );
  }
  if (!redirect_uri) {
    throw new Error(
      'redirect_uri not found. Make sure you have configured the EmbeddedChatApp on Rocket.Chat server'
    );
  }
  if (
    allowedOrigins.length &&
    !allowedOrigins.includes(window.location.origin)
  ) {
    throw new Error(
      'Origin not allowed. Make sure you have configured the EmbeddedChatApp on Rocket.Chat server'
    );
  }
  const authorizeUrl = getRCAuthorizeURL(
    config.api.baseUrl,
    redirect_uri,
    client_id
  );
  let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=800,height=600,left=-1000,top=-1000,rel=opener`;
  const popup = window.open(authorizeUrl, 'Login', params);

  return new Promise<any>((resolve, reject) => {
    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    let isSettled = false;
    let checkInterval: ReturnType<typeof setInterval> | undefined;

    const cleanup = () => {
      if (checkInterval !== undefined) {
        clearInterval(checkInterval);
        checkInterval = undefined;
      }
      window.removeEventListener('message', onMessage);
    };

    const onMessage = async (e: MessageEvent) => {
      try {
        if (e.origin !== new URL(config.api.baseUrl).origin) {
          return;
        }
      } catch {
        return;
      }

      if (
        e.data &&
        typeof e.data === 'object' &&
        e.data.type === 'rc-oauth-callback'
      ) {
        if (isSettled) {
          return;
        }
        try {
          const { accessToken, expiresIn, serviceName } =
            e.data.credentials || {};
          const response = await config.api.post('/api/v1/login', {
            accessToken,
            expiresIn,
            serviceName,
          });
          isSettled = true;
          cleanup();
          try {
            popup.close();
          } catch {
            // Popup may have already been closed
          }
          resolve(response.data);
        } catch (err) {
          isSettled = true;
          cleanup();
          try {
            popup.close();
          } catch {
            // Popup may have already been closed
          }
          reject(err);
        }
      }
    };

    window.addEventListener('message', onMessage);

    checkInterval = setInterval(() => {
      try {
        if (popup.closed) {
          cleanup();
          if (!isSettled) {
            isSettled = true;
            reject(new Error('User closed the login popup'));
          }
        }
      } catch {
        // Suppress potential cross-origin access exceptions on popup.closed
      }
    }, 500);
  });
};

export default loginWithRocketChatOAuth;
