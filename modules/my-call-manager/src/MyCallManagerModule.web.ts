import { registerWebModule, NativeModule } from 'expo';

class MyCallManagerModule extends NativeModule<{}> {}

export default registerWebModule(MyCallManagerModule, 'MyCallManagerModule');
