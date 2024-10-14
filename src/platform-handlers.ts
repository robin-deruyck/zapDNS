import {Context} from "./types";
import {win32Context} from "./context/win32";
import {darwinContext} from "./context/darwin";
import {linuxContext} from "./context/linux";


const ContextLoader: { [p: string]: Context } = {
  win32: win32Context,
  darwin: darwinContext,
  linux: linuxContext
}

export const createPlatformHandler = (platform: string = 'default'): Context => {
  if (platform === 'default') {
    throw new Error('Platform not supported')
  }
  return ContextLoader[platform]
}
