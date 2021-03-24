export const isOfflineHost = (host: string) => (host === "localhost:11002") || (host === "activity-player-offline.concord.org");

export const getCanonicalHostname = () => {
  if(window.location.hostname === "activity-player-offline.concord.org") {
    return "activity-player.concord.org";
  }
  return window.location.hostname;
};

export const getHostnameWithMaybePort = () => window.location.host;

export const isProduction = (location: {origin: string, pathname: string}, options?: {allowVersions?: boolean}) => {
  const {origin, pathname} = location;
  const {allowVersions} = options || {allowVersions: false};
  const isProductionOrigin = origin === "https://activity-player.concord.org" || origin === "https://activity-player-offline.concord.org";
  const isRoot = !pathname || pathname === "/" || pathname === "/index.html";
  const isVersion = /^\/version\//.test(pathname);
  const isOfflineMode = /^\/branch\/offline-mode\//.test(pathname);
  return isProductionOrigin && (isRoot || (isVersion && allowVersions) || isOfflineMode);
};
