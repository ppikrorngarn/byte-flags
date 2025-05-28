/**
 * Abstract base class for efficiently storing and managing boolean flags in a numeric value.
 * This provides the common functionality for ByteFlags, ShortFlags, and LongFlags.
 */
export abstract class BaseFlags {
  // ===== PROTECTED PROPERTIES =====

  /** The internal value storing all flags */
  protected value = 0;

  /** Current index for the next flag to be added */
  protected nextIndex = 0;

  /** List of all flag names in order of creation */
  protected readonly flagList: readonly string[] = [];

  /** Mapping of flag names to their bit positions */
  protected readonly flagIndices = new Map<string, number>();

  /** Maximum number of flags that can be stored */
  protected abstract readonly MAX_FLAGS: number;

  /** Maximum value (based on storage size) */
  protected abstract readonly MAX_VALUE: number;

  // ===== CONSTRUCTOR =====

  /**
   * Create a new flags instance with the specified flag names
   * @param flagNames Names of flags to initialize
   * @throws Error if no flag names are provided or if flag names are invalid
   */
  constructor(...flagNames: string[]) {
    if (flagNames.length === 0) {
      throw new Error("At least one flag name must be provided");
    }

    // Note: Max flags validation must be done in subclass constructors
    // since we can't access abstract properties here

    // Add each flag to the instance
    for (const name of flagNames) {
      this.addFlag(name);
    }
  }

  // ===== PROTECTED METHODS =====

  /**
   * Add a new flag to this instance
   * @param name Name of the flag to add
   * @throws Error if more than maximum number of flags are added or if flag name is invalid
   */
  protected addFlag(name: string): void {
    if (this.nextIndex >= this.MAX_FLAGS) {
      throw new Error(`Cannot add more than ${this.MAX_FLAGS} flags`);
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
   * @param position Bit position
   * @returns Boolean value of the bit
   */
  protected getBit(position: number): boolean {
    return Boolean(this.value & (1 << position));
  }

  /**
   * Set the value of a bit at the specified position
   * @param position Bit position
   * @param value Boolean value to set
   */
  protected setBit(position: number, value: boolean): void {
    if (value) {
      this.value |= 1 << position;
    } else {
      this.value &= ~(1 << position);
    }
  }

  // ===== PUBLIC METHODS: FLAG OPERATIONS =====

  /**
   * Check if a flag exists in this instance
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
    this.setBit(idx, !this.getBit(idx));
    return this;
  }

  /**
   * Set multiple flags at once
   * @param flags Object with flag names as keys and boolean values
   * @returns This instance for chaining
   */
  public setFlags(flags: Record<string, boolean>): this {
    for (const [name, value] of Object.entries(flags)) {
      if (this.hasFlag(name)) {
        this.setFlag(name, value);
      }
    }
    return this;
  }

  /**
   * Toggle multiple flags at once
   * @param names Names of the flags to toggle
   * @returns This instance for chaining
   */
  public toggleFlags(...names: string[]): this {
    for (const name of names) {
      if (this.hasFlag(name)) {
        this.toggleFlag(name);
      }
    }
    return this;
  }

  /**
   * Get the number of flags currently set to true
   * @returns Count of set flags
   */
  public count(): number {
    let count = 0;
    for (let i = 0; i < this.nextIndex; i++) {
      if (this.getBit(i)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if any flag is set to true
   * @returns True if any flag is true
   */
  public any(): boolean {
    return this.value !== 0;
  }

  /**
   * Check if no flags are set to true
   * @returns True if all flags are false
   */
  public none(): boolean {
    return this.value === 0;
  }

  /**
   * Convert the flags to a numeric value
   * @returns Numeric representation of all flags
   */
  public toValue(): number {
    return this.value;
  }

  /**
   * Load flags from a numeric value
   * @param v Value to load
   * @returns This instance for chaining
   * @throws Error if the value is invalid
   */
  public fromValue(v: number): this {
    if (!Number.isInteger(v) || v < 0 || v > this.MAX_VALUE) {
      throw new Error(`Value must be integer 0-${this.MAX_VALUE}`);
    }
    this.value = v;
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

  /**
   * Get an array of all flag names
   * @returns Array of all flag names in order of creation
   */
  public getFlagNames(): string[] {
    return [...this.flagList];
  }

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
   * @returns String in the format "FlagsType {flag1=true, flag2=false, ...}"
   */
  public toString(): string {
    const flags = Array.from(this)
      .map(([name, value]) => `${name}=${value}`)
      .join(", ");
    return `${this.constructor.name} {${flags}}`;
  }

  /**
   * @deprecated Use getFlagNames() instead for better clarity
   * @returns Array of all flag names
   */
  public getFlags(): string[] {
    return this.getFlagNames();
  }
}
