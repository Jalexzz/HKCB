import { requireNativeModule } from 'expo-modules-core';

// This links directly to the name defined in your Swift file: Name("MyCallManager")
const MyCallManager = requireNativeModule('MyCallManager');

export async function setBlockStateAndReload(isActive: boolean, identifier: string): Promise<boolean> {
  return await MyCallManager.setBlockStateAndReload(isActive, identifier);
}