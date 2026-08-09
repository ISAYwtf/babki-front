interface UnauthorizedSessionContext {
  status?: number;
  url?: string;
  authorization?: string | null;
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
  return /(^|\/)auth\/(login|register)\/?$/.test(path);
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
}: UnauthorizedSessionContext) => {
  const bearerAuthorization = getBearerAuthorization(authorization);

  if (
    status !== 401
    || isPublicAuthEndpoint(url)
    || !bearerAuthorization
    || !unauthorizedSessionHandler
    || bearerAuthorization === handledAuthorization
  ) {
    return false;
  }

  handledAuthorization = bearerAuthorization;
  unauthorizedSessionHandler();
  return true;
};
