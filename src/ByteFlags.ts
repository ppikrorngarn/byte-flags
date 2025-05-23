/**
 * A utility class for efficiently storing and managing boolean flags in a single byte (8 bits).
 *
 * This class provides a memory-efficient way to store up to 8 boolean flags in a single byte,
 * with methods to manipulate individual flags, convert to/from a byte representation for storage,
 * and toggle flag states. It's particularly useful for scenarios requiring compact serialization
 * of multiple boolean values, such as permission systems, feature flags, or status tracking.
 *
 * The class is immutable in terms of flag names after creation, ensuring type safety and preventing
 * accidental addition of new flags at runtime. All flag operations are type-checked when using TypeScript.
 *
 * @class ByteFlags
 * @see README.md for detailed examples and API reference
 */

// Maximum number of flags that can be stored in a single byte
const MAX_FLAGS = 8;

// Maximum byte value (2^8 - 1)
const MAX_BYTE_VALUE = 0xff;

export class ByteFlags {
  /** The internal byte value storing all flags */
  private byte = 0;

  /** Current index for the next flag to be added */
  private nextIndex = 0;

  /** List of all flag names in order of creation */
  private readonly flagList: readonly string[] = [];

  /** Mapping of flag names to their bit positions */
  private readonly flagIndices = new Map<string, number>();

  /**
   * Create a new ByteFlags instance with the specified flag names
   * @param flagNames Names of flags to initialize
   * @throws Error if more than 8 flags are provided
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length > MAX_FLAGS) {
      throw new Error(`Cannot have more than ${MAX_FLAGS} flags`);
    }

    // Add each flag to the instance
    for (const name of flagNames) {
      this.addFlag(name);
    }
  }

  // ===== PRIVATE METHODS =====

  /**
   * Add a new flag to this ByteFlags instance
   * @param name Name of the flag to add
   * @throws Error if more than 8 flags are added
   * @throws Error if a duplicate flag name is provided
   */
  private addFlag(name: string): void {
    if (this.nextIndex >= MAX_FLAGS) {
      throw new Error(`Cannot add more than ${MAX_FLAGS} flags`);
    }

    if ((this.flagList as string[]).includes(name)) {
      throw new Error(`Duplicate flag: ${name}`);
    }

    const idx = this.nextIndex++;
    (this.flagList as string[]).push(name);
    this.flagIndices.set(name, idx);

    // Define property getters/setters for direct access (flags.isAdmin)
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: false,
      get: () => this.getBit(idx),
      set: (value: boolean) => this.setBit(idx, value),
    });
  }

  /**
   * Get the value of a bit at the specified position
   * @param position Bit position (0-7)
   * @returns Boolean value of the bit
   */
  private getBit(position: number): boolean {
    return Boolean(this.byte & (1 << position));
  }

  /**
   * Set the value of a bit at the specified position
   * @param position Bit position (0-7)
   * @param value Boolean value to set
   */
  private setBit(position: number, value: boolean): void {
    if (value) {
      this.byte |= 1 << position;
    } else {
      this.byte &= ~(1 << position);
    }
  }

  // ===== FLAG EXISTENCE =====

  /**
   * Check if a flag exists in this ByteFlags instance
   * @param name The name of the flag to check
   * @returns True if the flag exists, false otherwise
   */
  public hasFlag(name: string): boolean {
    return this.flagIndices.has(name);
  }

  /**
   * Get all flag names in this ByteFlags instance
   * @returns Array of flag names
   */
  public getFlags(): string[] {
    return [...this.flagList];
  }

  // ===== FLAG OPERATIONS =====

  /**
   * Get the value of a flag by name
   * @param name The name of the flag to get
   * @returns The boolean value of the flag
   * @throws Error if the flag doesn't exist
   */
  public getFlag(name: string): boolean {
    if (!this.hasFlag(name)) {
      throw new Error(`Flag '${name}' does not exist`);
    }
    const idx = this.flagIndices.get(name)!;
    return this.getBit(idx);
  }

  /**
   * Set the value of a flag by name
   * @param name The name of the flag to set
   * @param value The boolean value to set
   * @returns This instance for chaining
   * @throws Error if the flag doesn't exist
   */
  public setFlag(name: string, value: boolean): this {
    if (!this.hasFlag(name)) {
      throw new Error(`Flag '${name}' does not exist`);
    }
    const idx = this.flagIndices.get(name)!;
    this.setBit(idx, value);
    return this;
  }

  /**
   * Toggle a flag's value
   * @param name The name of the flag to toggle
   * @returns This instance for chaining
   * @throws Error if the flag doesn't exist
   */
  public toggleFlag(name: string): this {
    if (!this.hasFlag(name)) {
      throw new Error(`Flag '${name}' does not exist`);
    }
    const idx = this.flagIndices.get(name)!;
    this.byte ^= 1 << idx;
    return this;
  }

  // ===== SERIALIZATION =====

  /**
   * Convert the flags to a byte value (0-255)
   * @returns Byte representation of all flags
   */
  public toByte(): number {
    return this.byte;
  }

  /**
   * Load flags from a byte value
   * @param b Byte value to load (0-255)
   * @returns This instance for chaining
   * @throws Error if the byte value is invalid
   */
  public fromByte(b: number): this {
    if (!Number.isInteger(b) || b < 0 || b > MAX_BYTE_VALUE) {
      throw new Error(`Byte must be integer 0-${MAX_BYTE_VALUE}`);
    }
    this.byte = b;
    return this;
  }

  /**
   * Convert the flags to a plain JavaScript object
   * @returns Object with flag names as keys and boolean values
   */
  public toObject(): Record<string, boolean> {
    return this.flagList.reduce((obj, name) => {
      obj[name] = this.getFlag(name);
      return obj;
    }, {} as Record<string, boolean>);
  }
}
