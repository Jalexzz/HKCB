import { requireNativeModule } from 'expo-modules-core';
const MyCallManager = requireNativeModule('MyCallManager');

export async function setBlockStateAndReload(
  isActive: boolean,
  startNumber: number,
  endNumber: number,
  identifier: string
): Promise<boolean> {
  return await MyCallManager.setBlockStateAndReload(
    isActive,
    startNumber,
    endNumber,
    identifier
  );
}
