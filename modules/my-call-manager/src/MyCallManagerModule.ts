import { NativeModule, requireNativeModule } from 'expo';

declare class MyCallManagerModule extends NativeModule<{}> {}

export default requireNativeModule<MyCallManagerModule>('MyCallManager');
