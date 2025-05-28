import { BaseFlags } from "./BaseFlags";
import { ByteFlags } from "./ByteFlags";
import { ShortFlags } from "./ShortFlags";
import { LongFlags } from "./LongFlags";

/**
 * Type utility to create a mapped type that includes both the original flag type
 * and the dynamic flag properties with proper typing.
 */
export type WithFlags<T extends string> = {
  [K in T]: boolean;
};

/**
 * Type that represents a flags instance with dynamically added flag properties
 * @template T Flag name string literal type
 * @template F Flag class type (ByteFlags, ShortFlags, LongFlags)
 */
export type FlagsWithFlags<T extends string, F extends BaseFlags> = F &
  WithFlags<T>;

/**
 * Type that represents a ByteFlags instance with dynamically added flag properties
 */
export type ByteFlagsWithFlags<T extends string> = FlagsWithFlags<T, ByteFlags>;

/**
 * Type that represents a ShortFlags instance with dynamically added flag properties
 */
export type ShortFlagsWithFlags<T extends string> = FlagsWithFlags<
  T,
  ShortFlags
>;

/**
 * Type that represents a LongFlags instance with dynamically added flag properties
 */
export type LongFlagsWithFlags<T extends string> = FlagsWithFlags<T, LongFlags>;
