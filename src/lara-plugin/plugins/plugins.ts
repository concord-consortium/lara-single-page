import { IRegisterPluginOptions } from "../plugin-api";
import {
  IPluginContextOptions, IPluginRuntimeContextOptions, IPluginAuthoringContextOptions, generateRuntimePluginContext,
  generateAuthoringPluginContext
} from "./plugin-context";

const pluginError = (e: string, other: any) => {
  // tslint:disable-next-line:no-console
  console.group("LARA Plugin Error");
  // tslint:disable-next-line:no-console
  console.error(e);
  // tslint:disable-next-line:no-console
  console.dir(other);
  // tslint:disable-next-line:no-console
  console.groupEnd();
};

/** @hidden Note, we call these `classes` but any constructor function will do. */
const pluginClasses: { [label: string]: IRegisterPluginOptions } = {};

/**
 * Called in plugins/_show.haml before each plugin is loaded.  The value is used by #registerPlugin
 * to override the plugin's passed label.  This removes the previous need for the plugin's label to
 * match the label in LARA's database.
 */
let nextPluginLabel = "";
export const setNextPluginLabel = (override: string) => {
  nextPluginLabel = override;
};

/****************************************************************************
 Note that this method is NOT meant to be called by plugins. It's used by LARA internals.
 This method is called to initialize the plugin.
 Called at runtime by LARA to create an instance of the plugin as would happen in `views/plugin/_show.html.haml`.
 @param label The the script identifier.
 @param options Initial plugin context generated by LARA. Will be transformed into IPluginRuntimeContext instance.
 ****************************************************************************/
export const initPlugin = (label: string, options: IPluginContextOptions) => {
  if (options.type === "authoring") {
    initAuthoringPlugin(label, options);
  }
  else {
    initRuntimePlugin(label, options);
  }
};

const initRuntimePlugin = (label: string, options: IPluginRuntimeContextOptions) => {
  if (!pluginClasses[label]) {
    // tslint:disable-next-line:no-console
    console.error(`initRuntimePlugin cannot find plugin class with label: ${label}. Plugin instance is not loaded.`);
    return;
  }
  const Constructor = pluginClasses[label].runtimeClass;
  if (typeof Constructor === "function") {
    try {
      // ACTIVITY_PLAYER_CODE:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const plugin = new Constructor(generateRuntimePluginContext(options));
    } catch (e) {
      pluginError(e, options);
    }
    // tslint:disable-next-line:no-console
    console.info("Plugin", label, "is now registered");
  } else {
    // tslint:disable-next-line:no-console
    console.error("No plugin registered for label:", label);
  }
};

const initAuthoringPlugin = (label: string, options: IPluginAuthoringContextOptions) => {
  const Constructor = pluginClasses[label].authoringClass;
  if (typeof Constructor === "function") {
    try {
      // ACTIVITY_PLAYER_CODE:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const plugin = new Constructor(generateAuthoringPluginContext(options));
    } catch (e) {
      pluginError(e, options);
    }
    // tslint:disable-next-line:no-console
    console.info("Plugin", label, "is now registered");
  } else {
    // tslint:disable-next-line:no-console
    console.error("No plugin registered for label:", label);
  }
};

/****************************************************************************
 Register a new external script
 ```
 registerPlugin({runtimeClass: DebuggerRuntime, authoringClass?: DebuggerAuthoring})
 ```
 @param options The registration options
 @returns `true` if plugin was registered correctly.
 ***************************************************************************/
export const registerPlugin = (options: IRegisterPluginOptions): boolean => {
  // ACTIVITY_PLAYER_CODE:
  const currentScriptId = document.currentScript?.getAttribute("data-id");
  nextPluginLabel = currentScriptId || nextPluginLabel;

  if (nextPluginLabel === "") {
    // tslint:disable-next-line:no-console
    console.error("nextPluginLabel not set via #setNextPluginLabel before plugin loaded!");
    return false;
  }
  const {runtimeClass, authoringClass} = options;
  if (typeof runtimeClass !== "function") {
    // tslint:disable-next-line:no-console
    console.error("Plugin did not provide a runtime constructor", nextPluginLabel);
    return false;
  }
  if (typeof authoringClass !== "function") {
    // tslint:disable-next-line:no-console
    console.warn(`Plugin did not provide an authoring constructor. This is ok if "guiAuthoring"
                  is not set for this component.`, nextPluginLabel);
}
  if (pluginClasses[nextPluginLabel]) {
    // tslint:disable-next-line:no-console
    console.error("Duplicate Plugin for label", nextPluginLabel);
    return false;
  } else {
    pluginClasses[nextPluginLabel] = options;
    nextPluginLabel = "";
    return true;
  }
};
