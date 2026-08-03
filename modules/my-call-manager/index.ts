import { requireNativeModule } from 'expo-modules-core';
const MyCallManager = requireNativeModule('MyCallManager');

export async function setBlockStateAndReload(
  isActive: boolean, 
  identifier: string,
  prefixes: number[],
  specifics: Record<string, string>
): Promise<boolean> {
  return await MyCallManager.setBlockStateAndReload(isActive, identifier, prefixes, specifics);
}