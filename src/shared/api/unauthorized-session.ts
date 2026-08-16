interface UnauthorizedSessionContext {
  status?: number;
  url?: string;
  authorization?: string | null;
  currentAuthorization?: string | null;
  suppressSessionInvalidation?: boolean;
}

type UnauthorizedSessionHandler = () => void;

let unauthorizedSessionHandler: UnauthorizedSessionHandler | null = null;
let handledAuthorization: string | null = null;

const getBearerAuthorization = (authorization: string | null | undefined) => {
  if (!authorization?.startsWith('Bearer ') || authorization.length <= 'Bearer '.length) {
    return null;
  }

  return authorization;
};

const isPublicAuthEndpoint = (url: string | undefined) => {
  const path = url?.split(/[?#]/, 1)[0] ?? '';
  return /(^|\/)auth\/(login(?:\/two-factor)?|register)\/?$/.test(path);
};

export const setUnauthorizedSessionHandler = (handler: UnauthorizedSessionHandler | null) => {
  unauthorizedSessionHandler = handler;
  handledAuthorization = null;
};

export const resetUnauthorizedSessionHandling = () => {
  handledAuthorization = null;
};

export const handleUnauthorizedSession = ({
  status,
  url,
  authorization,
  currentAuthorization,
  suppressSessionInvalidation,
}: UnauthorizedSessionContext) => {
  const bearerAuthorization = getBearerAuthorization(authorization);
  const currentBearerAuthorization = currentAuthorization === undefined
    ? undefined
    : getBearerAuthorization(currentAuthorization);

  if (
    status !== 401
    || suppressSessionInvalidation
    || isPublicAuthEndpoint(url)
    || !bearerAuthorization
    || (currentBearerAuthorization !== undefined
      && bearerAuthorization !== currentBearerAuthorization)
    || !unauthorizedSessionHandler
    || bearerAuthorization === handledAuthorization
  ) {
    return false;
  }

  handledAuthorization = bearerAuthorization;
  unauthorizedSessionHandler();
  return true;
};
