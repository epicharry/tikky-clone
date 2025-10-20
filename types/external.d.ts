// External module declarations to resolve TypeScript issues

declare module '@react-native-async-storage/async-storage' {
  export default class AsyncStorage {
    static getItem(key: string): Promise<string | null>;
    static setItem(key: string, value: string): Promise<void>;
    static removeItem(key: string): Promise<void>;
    static multiRemove(keys: string[]): Promise<void>;
  }
}

declare module '@nkzw/create-context-hook' {
  function createContextHook<T>(
    hook: () => T
  ): [any, () => T];
  
  export default createContextHook;
}

declare module 'expo-linear-gradient' {
  export const LinearGradient: any;
}
