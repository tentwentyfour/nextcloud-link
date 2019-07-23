import { FileDetailProperty, AsyncFunction } from './types';
export declare function createFileDetailProperty(namespace: string, namespaceShort: string, element: string, nativeType?: boolean, defaultValue?: any): FileDetailProperty;
export declare function createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any): FileDetailProperty;
export declare function createNextCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any): FileDetailProperty;
export declare function clientFunction<T extends AsyncFunction>(λ: T): T;
