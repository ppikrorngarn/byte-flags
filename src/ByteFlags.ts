import type { ByteFlagsWithFlags } from "./types";

/**
 * Efficiently stores and manages up to 8 boolean flags in a single byte.
 *
 * Ideal for permission systems, feature flags, or status tracking where compact
 * serialization is needed. Flag names are fixed at creation for type safety.
 *
 * @example
 * // Recommended usage with type safety:
 * const flags = createByteFlags('read', 'write', 'execute');
 * flags.read = true; // TypeScript knows this is a boolean
 *
 * @see {@link createByteFlags} for better TypeScript support
 */

// Maximum number of flags that can be stored in a single byte
const MAX_FLAGS = 8;

// Maximum byte value (2^8 - 1)
const MAX_BYTE_VALUE = 0xff;

export class ByteFlags {
  // ===== PRIVATE PROPERTIES =====

  /** The internal byte value storing all flags */
  private byte = 0;

  /** Current index for the next flag to be added */
  private nextIndex = 0;

  /** List of all flag names in order of creation */
  private readonly flagList: readonly string[] = [];

  /** Mapping of flag names to their bit positions */
  private readonly flagIndices = new Map<string, number>();

  // ===== CONSTRUCTOR =====

  /**
   * Create a new ByteFlags instance with the specified flag names
   * @param flagNames Names of flags to initialize (1-8 flags)
   * @throws Error if more than 8 flags are provided or if flag names are invalid
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length > MAX_FLAGS) {
      throw new Error(`Cannot have more than ${MAX_FLAGS} flags`);
    }

    if (flagNames.length === 0) {
      throw new Error("At least one flag name must be provided");
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
   * @throws Error if more than 8 flags are added or if flag name is invalid
   */
  private addFlag(name: string): void {
    if (this.nextIndex >= MAX_FLAGS) {
      throw new Error(`Cannot add more than ${MAX_FLAGS} flags`);
    }

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Flag name must be a non-empty string");
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

  // ===== PUBLIC METHODS: FLAG OPERATIONS =====

  /**
   * Check if a flag exists in this ByteFlags instance
   * @param name The name of the flag to check
   * @returns True if the flag exists, false otherwise
   */
  public hasFlag(name: string): boolean {
    return this.flagIndices.has(name);
  }

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

  // ===== PUBLIC METHODS: BULK OPERATIONS =====

  /**
   * Set multiple flags at once
   * @param flags Object with flag names as keys and boolean values
   * @returns This instance for chaining
   */
  public setFlags(flags: Record<string, boolean>): this {
    Object.entries(flags).forEach(([name, value]) => {
      if (this.hasFlag(name)) {
        this.setFlag(name, value);
      }
    });
    return this;
  }

  /**
   * Toggle multiple flags at once
   * @param names Names of the flags to toggle
   * @returns This instance for chaining
   */
  public toggleFlags(...names: string[]): this {
    names.forEach((name) => this.toggleFlag(name));
    return this;
  }

  // ===== PUBLIC METHODS: UTILITY =====

  /**
   * Get the number of flags currently set to true
   * @returns Count of set flags
   */
  public count(): number {
    let count = 0;
    for (let i = 0; i < this.nextIndex; i++) {
      if (this.getBit(i)) count++;
    }
    return count;
  }

  /**
   * Check if any flag is set to true
   * @returns True if any flag is true
   */
  public any(): boolean {
    return this.byte !== 0;
  }

  /**
   * Check if no flags are set to true
   * @returns True if all flags are false
   */
  public none(): boolean {
    return this.byte === 0;
  }

  // ===== PUBLIC METHODS: SERIALIZATION =====

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

  /**
   * Convert the flags to a JSON string
   * @returns JSON string representation of the flags
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject());
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

  // ===== PUBLIC METHODS: FLAG CHECKS =====

  /**
   * Check if all specified flags are set to true
   * @param flags Flag names to check
   * @returns True if all specified flags are true
   */
  public all(...flags: string[]): boolean {
    return flags.every((flag) => this.getFlag(flag));
  }

  /**
   * Check if any of the specified flags are set to true
   * @param flags Flag names to check
   * @returns True if any specified flag is true
   */
  public anyOf(...flags: string[]): boolean {
    return flags.some((flag) => this.getFlag(flag));
  }

  /**
   * Check if none of the specified flags are set to true
   * @param flags Flag names to check
   * @returns True if no specified flags are true
   */
  public noneOf(...flags: string[]): boolean {
    return !this.anyOf(...flags);
  }

  // ===== PUBLIC METHODS: FLAG METADATA =====

  /**
   * Get an array of all flag names
   * @returns Array of all flag names in order of creation
   */
  public getFlagNames(): string[] {
    return [...this.flagList];
  }

  // ===== STANDARD METHODS =====

  /**
   * Get an iterator for all flags as [name, value] pairs
   * @returns Iterator yielding [name, boolean] tuples
   */
  public *[Symbol.iterator](): IterableIterator<[string, boolean]> {
    for (const name of this.flagList) {
      yield [name, this.getFlag(name)];
    }
  }

  /**
   * Get a string representation of the flags
   * @returns String in the format "ByteFlags {flag1=true, flag2=false, ...}"
   */
  public toString(): string {
    const flags = Array.from(this)
      .map(([name, value]) => `${name}=${value}`)
      .join(", ");
    return `ByteFlags {${flags}}`;
  }

  // ===== DEPRECATED METHODS =====

  /**
   * @deprecated Use getFlagNames() instead for better clarity
   * @returns Array of all flag names
   */
  public getFlags(): string[] {
    return this.getFlagNames();
  }
}

/**
 * Creates a type-safe ByteFlags instance with the specified flag names
 * @example
 * // Basic usage
 * const flags = createByteFlags('read', 'write');
 * flags.read = true; // TypeScript knows this is a boolean
 *
 * // With explicit type
 * type AppFlags = 'darkMode' | 'notifications' | 'analytics';
 * const features = createByteFlags<AppFlags>('darkMode', 'notifications');
 * features.darkMode = true; // OK
 */
export function createByteFlags<T extends string>(
  ...flagNames: T[]
): ByteFlagsWithFlags<T> {
  return new ByteFlags(...flagNames) as ByteFlagsWithFlags<T>;
}
