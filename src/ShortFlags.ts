import { BaseFlags } from "./BaseFlags";
import type { FlagsWithFlags } from "./types";

/**
 * Efficiently stores and manages up to 16 boolean flags in a single short (16-bit value).
 *
 * Ideal for permission systems, feature flags, or status tracking where compact
 * serialization is needed and more than 8 flags are required.
 *
 * @example
 * // Recommended usage with type safety:
 * const flags = createShortFlags('read', 'write', 'execute', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * @see {@link createShortFlags} for better TypeScript support
 */
export class ShortFlags extends BaseFlags {
  // For use in constructor
  private static readonly _MAX_FLAGS = 16;
  private static readonly _MAX_VALUE = 0xffff;

  // Maximum number of flags that can be stored in a single short (16 bits)
  protected readonly MAX_FLAGS = ShortFlags._MAX_FLAGS;

  // Maximum short value (2^16 - 1)
  protected readonly MAX_VALUE = ShortFlags._MAX_VALUE;

  /**
   * Create a new ShortFlags instance with the specified flag names
   * @param flagNames Names of flags to initialize (1-16 flags)
   * @throws Error if more than 16 flags are provided or if flag names are invalid
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length > ShortFlags._MAX_FLAGS) {
      throw new Error(`Cannot have more than ${ShortFlags._MAX_FLAGS} flags`);
    }
    super(...flagNames);
  }

  /**
   * Create a ShortFlags instance from a JSON string
   * @param json JSON string or object from toJSON()
   * @returns New ShortFlags instance
   * @throws Error if JSON is invalid or flags don't match
   */
  public static fromJSON(json: string | object): ShortFlags {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    const instance = new ShortFlags(...Object.keys(obj));
    return instance.setFlags(obj);
  }

  /**
   * Convert the flags to a short value (0-65535)
   * @returns Short representation of all flags
   */
  public toShort(): number {
    return this.toValue();
  }

  /**
   * Load flags from a short value
   * @param s Short value to load (0-65535)
   * @returns This instance for chaining
   * @throws Error if the short value is invalid
   */
  public fromShort(s: number): this {
    return this.fromValue(s);
  }
}

/**
 * Creates a type-safe ShortFlags instance with the specified flag names
 * @example
 * // Basic usage
 * const flags = createShortFlags('read', 'write', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * // With explicit type
 * type AppFlags = 'darkMode' | 'notifications' | 'analytics';
 * const features = createShortFlags<AppFlags>('darkMode', 'notifications', 'analytics');
 * features.darkMode = true; // OK
 */
export function createShortFlags<T extends string>(
  ...flagNames: T[]
): FlagsWithFlags<T, ShortFlags> {
  return new ShortFlags(...flagNames) as FlagsWithFlags<T, ShortFlags>;
}
