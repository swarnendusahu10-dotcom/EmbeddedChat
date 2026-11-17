async function saveTokenLocalStorage(token, key = 'ec_token') {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, token);
  }
}

async function getTokenLocalStorage(key = 'ec_token') {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

async function deleteTokenLocalStorage(key = 'ec_token') {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

async function saveTokenSecure(token, authHandler = null) {
  const handler =
    authHandler && typeof authHandler.handleSecureLogin === 'function'
      ? authHandler
      : this && typeof this.handleSecureLogin === 'function'
      ? this
      : null;

  if (handler) {
    try {
      return await handler.handleSecureLogin('save', token);
    } catch (error) {
      console.error('Failed to save secure auth token:', error);
    }
  }
}

async function getTokenSecure(authHandler = null) {
  const handler =
    authHandler && typeof authHandler.handleSecureLogin === 'function'
      ? authHandler
      : this && typeof this.handleSecureLogin === 'function'
      ? this
      : null;

  if (handler) {
    try {
      const response = await handler.handleSecureLogin('get');
      return response?.token !== undefined ? response.token : null;
    } catch (error) {
      console.error('Failed to get secure auth token:', error);
      return null;
    }
  }
  return null;
}

async function deleteTokenSecure(authHandler = null) {
  const handler =
    authHandler && typeof authHandler.handleSecureLogin === 'function'
      ? authHandler
      : this && typeof this.handleSecureLogin === 'function'
      ? this
      : null;

  if (handler) {
    try {
      return await handler.handleSecureLogin('delete');
    } catch (error) {
      console.error('Failed to delete secure auth token:', error);
    }
  }
}

export function getTokenStorage(
  secure = false,
  key = 'ec_token',
  authHandler = null
) {
  if (secure) {
    return {
      saveToken: function (token) {
        return saveTokenSecure.call(this, token, authHandler);
      },
      getToken: function () {
        return getTokenSecure.call(this, authHandler);
      },
      deleteToken: function () {
        return deleteTokenSecure.call(this, authHandler);
      },
    };
  }
  return {
    saveToken: (token) => saveTokenLocalStorage(token, key),
    getToken: () => getTokenLocalStorage(key),
    deleteToken: () => deleteTokenLocalStorage(key),
  };
}
