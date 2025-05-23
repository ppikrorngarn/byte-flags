import { ByteFlags } from './ByteFlags';

/**
 * Type utility to create a mapped type that includes both the original ByteFlags type
 * and the dynamic flag properties with proper typing.
 */
export type WithFlags<T extends string> = {
  [K in T]: boolean;
};

/**
 * Type that represents a ByteFlags instance with dynamically added flag properties
 */
export type ByteFlagsWithFlags<T extends string> = ByteFlags & WithFlags<T>;
