const debug = (window.localStorage ? window.localStorage.getItem("debug") : undefined) || "";
if (debug.length > 0) {
  console.info("DEBUG:", debug);
}

const debugContains = (key: string) => debug.indexOf(key) !== -1;

export const DEBUG_LOGGER = debugContains("logger");
