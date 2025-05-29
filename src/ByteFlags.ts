import { BaseFlags } from "./BaseFlags";
import type { FlagsWithFlags } from "./types";

/**
 * Efficiently stores and manages up to 8 boolean flags in a single byte (8-bit value).
 *
 * Ideal for permission systems, feature flags, or status tracking where compact
 * serialization is needed. Flag names are fixed at creation for type safety.
 *
 * @example
 * // Recommended usage with type safety:
 * const flags = createByteFlags('read', 'write', 'execute', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * @see {@link createByteFlags} for better TypeScript support
 */
export class ByteFlags extends BaseFlags {
  // For use in constructor
  private static readonly _MAX_FLAGS = 8;
  private static readonly _MAX_VALUE = 0xff;

  // Maximum number of flags that can be stored in a single byte
  protected readonly MAX_FLAGS = ByteFlags._MAX_FLAGS;

  // Maximum byte value (2^8 - 1)
  protected readonly MAX_VALUE = ByteFlags._MAX_VALUE;

  /**
   * Create a new ByteFlags instance with the specified flag names
   * @param flagNames Names of flags to initialize (1-8 flags)
   * @throws Error if more than 8 flags are provided or if flag names are invalid
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length > ByteFlags._MAX_FLAGS) {
      throw new Error(`Cannot have more than ${ByteFlags._MAX_FLAGS} flags`);
    }
    super(...flagNames);
  }

  /**
   * Convert the flags to a byte value (0-255)
   * @returns Byte representation of all flags
   */
  public toByte(): number {
    return this.toValue();
  }

  /**
   * Load flags from a byte value
   * @param b Byte value to load (0-255)
   * @returns This instance for chaining
   * @throws Error if the byte value is invalid
   */
  public fromByte(b: number): this {
    return this.fromValue(b);
  }

  /**
   * Create a ByteFlags instance from a JSON string
   * @param json JSON string or object from toJSON()
   * @returns New ByteFlags instance
   * @throws Error if JSON is invalid or flags don't match
   */
  public static fromJSON(json: string | object): ByteFlags {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    const instance = new ByteFlags(...Object.keys(obj));
    return instance.setFlags(obj);
  }
}

/**
 * Creates a type-safe ByteFlags instance with the specified flag names
 * @example
 * // Basic usage
 * const flags = createByteFlags('read', 'write', 'admin', 'guest');
 * flags.admin = true; // TypeScript knows this is a boolean
 *
 * // With explicit type
 * type AppFlags = 'darkMode' | 'notifications' | 'analytics';
 * const features = createByteFlags<AppFlags>('darkMode', 'notifications', 'analytics');
 * features.darkMode = true; // OK
 */
export function createByteFlags<T extends string>(
  ...flagNames: T[]
): FlagsWithFlags<T, ByteFlags> {
  return new ByteFlags(...flagNames) as FlagsWithFlags<T, ByteFlags>;
}
