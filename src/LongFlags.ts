import { BaseFlags } from "./BaseFlags";
import type { FlagsWithFlags } from "./types";

/**
 * Efficiently stores and manages up to 32 boolean flags in a single long (32-bit value).
 *
 * Ideal for permission systems, feature flags, or status tracking where compact
 * serialization is needed and many flags are required.
 *
 * @example
 * // Recommended usage with type safety:
 * const flags = createLongFlags('read', 'write', 'execute', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * @see {@link createLongFlags} for better TypeScript support
 */
export class LongFlags extends BaseFlags {
  // For use in constructor
  private static readonly _MAX_FLAGS = 32;
  private static readonly _MAX_VALUE = 0xffffffff;

  // Maximum number of flags that can be stored in a single long (32 bits)
  protected readonly MAX_FLAGS = LongFlags._MAX_FLAGS;

  // Maximum long value (2^32 - 1)
  protected readonly MAX_VALUE = LongFlags._MAX_VALUE;

  /**
   * Create a new LongFlags instance with the specified flag names
   * @param flagNames Names of flags to initialize (1-32 flags)
   * @throws Error if more than 32 flags are provided or if flag names are invalid
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length > LongFlags._MAX_FLAGS) {
      throw new Error(`Cannot have more than ${LongFlags._MAX_FLAGS} flags`);
    }
    super(...flagNames);
  }

  /**
   * Create a LongFlags instance from a JSON string
   * @param json JSON string or object from toJSON()
   * @returns New LongFlags instance
   * @throws Error if JSON is invalid or flags don't match
   */
  public static fromJSON(json: string | object): LongFlags {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    const instance = new LongFlags(...Object.keys(obj));
    return instance.setFlags(obj);
  }

  /**
   * Convert the flags to a long value (0-4294967295)
   * @returns Long representation of all flags
   */
  public toLong(): number {
    return this.toValue();
  }

  /**
   * Load flags from a long value
   * @param l Long value to load (0-4294967295)
   * @returns This instance for chaining
   * @throws Error if the long value is invalid
   */
  public fromLong(l: number): this {
    return this.fromValue(l);
  }
}

/**
 * Creates a type-safe LongFlags instance with the specified flag names
 * @example
 * // Basic usage
 * const flags = createLongFlags('read', 'write', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * // With explicit type
 * type AppFlags = 'darkMode' | 'notifications' | 'analytics';
 * const features = createLongFlags<AppFlags>('darkMode', 'notifications', 'analytics');
 * features.darkMode = true; // OK
 */
export function createLongFlags<T extends string>(
  ...flagNames: T[]
): FlagsWithFlags<T, LongFlags> {
  return new LongFlags(...flagNames) as FlagsWithFlags<T, LongFlags>;
}
