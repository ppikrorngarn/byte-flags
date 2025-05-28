# ByteFlags

A lightweight, type-safe utility class for efficiently storing and managing up to 8 boolean flags in a single byte (8 bits). Ideal for permission systems, feature flags, status tracking, and any scenario requiring compact boolean storage.

## Features

- **Memory Efficient**: Stores up to 8 boolean flags in a single byte
- **Type-Safe**: Full TypeScript support with type checking
- **Immutable Flag Names**: Flag names are fixed at creation time for type safety
- **Multiple Access Methods**: Use property access or method calls
- **Bulk Operations**: Set/toggle multiple flags at once
- **Combination Checks**: Check multiple flags in a single call
- **Serialization**: Convert to/from byte, object, or JSON
- **Iterable**: Use `for...of` to loop through flags
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install @piyawasin/byte-flags
```

## Basic Usage

### Creating Instances

You can create a new ByteFlags instance in two ways:

1. **Using `createByteFlags` (Recommended for TypeScript users)**
   ```typescript
   import { createByteFlags } from "@piyawasin/byte-flags";
   
   // Basic usage
   const flags = createByteFlags("isAdmin", "hasAccess", "isVerified");
   
   // With explicit type for better type safety
   type FeatureFlags = 'darkMode' | 'notifications' | 'analytics';
   const features = createByteFlags<FeatureFlags>('darkMode', 'notifications');
   ```

2. **Using the `ByteFlags` constructor**
   ```typescript
   import { ByteFlags } from "@piyawasin/byte-flags";
   
   // Basic usage
   const flags = new ByteFlags("isAdmin", "hasAccess", "isVerified");
   
   // With type assertion for TypeScript
   type FeatureFlags = 'darkMode' | 'notifications' | 'analytics';
   const features = new ByteFlags('darkMode', 'notifications') as 
     ByteFlags & Record<FeatureFlags, boolean>;
   ```

> **Note**: The `createByteFlags` approach is preferred as it provides better type inference and cleaner syntax.

### Working with Flags

```typescript
import { createByteFlags } from "@piyawasin/byte-flags";

// Create a new ByteFlags instance
const flags = createByteFlags("isAdmin", "hasAccess", "isVerified", "isActive");

// Set flag values
flags.isAdmin = true;                // Property access
flags.setFlag("isAdmin", true);      // Method access

// Set multiple flags at once
flags.setFlags({
  hasAccess: true,
  isVerified: false
});

// Get flag values
console.log(flags.isAdmin);          // true (property access)
console.log(flags.getFlag("isAdmin")); // true (method access)

// Toggle flags
flags.toggleFlag("isVerified");      // Toggle a single flag
flags.toggleFlags("isActive", "isAdmin"); // Toggle multiple flags

// Check multiple flags
if (flags.all("isAdmin", "hasAccess")) {
  console.log("User has both admin and access");
}

if (flags.anyOf("isActive", "isVerified")) {
  console.log("User is either active or verified");
}

if (flags.noneOf("isBanned", "isSuspended")) {
  console.log("User is not banned or suspended");
}

// Count set flags
console.log(`${flags.count()} out of ${flags.size()} flags are set`);

// Convert to byte for storage
const byteValue = flags.toByte();
const restored = createByteFlags("isAdmin", "hasAccess", "isVerified", "isActive")
  .fromByte(byteValue);

// JSON serialization
const json = JSON.stringify(flags); // Uses toJSON() automatically
const fromJson = ByteFlags.fromJSON(JSON.parse(json));

// Iterate over flags
for (const [name, isSet] of flags) {
  console.log(`${name}: ${isSet}`);
}

// Get all flag names
const flagNames = flags.getFlagNames(); // Get all flag names as an array
// const oldWay = flags.getFlags();     // Deprecated: Use getFlagNames() instead

// Reset all flags
flags.reset();      // Set all flags to false
flags.setAll();     // Set all flags to true
```

## Type Safety with TypeScript

For advanced type safety in function returns, you can use the `ByteFlagsWithFlags<T>` type:

```typescript
import { type ByteFlagsWithFlags, createByteFlags } from "@piyawasin/byte-flags";

type AppPermissions = 'admin' | 'editor' | 'viewer';

function createPermissions(): ByteFlagsWithFlags<AppPermissions> {
  return createByteFlags<AppPermissions>('admin', 'editor', 'viewer');
}

const perms = createPermissions();

// Property access (type-safe)
perms.admin = true;
console.log(perms.admin);    // true

// Method access (type-safe)
perms.setFlag('editor', true);
console.log(perms.getFlag('editor'));  // true

// perms.unknown = true;                // Error: Property 'unknown' does not exist
// perms.setFlag('unknown', true);      // Error: Argument of type '"unknown"' is not assignable
// console.log(perms.unknownFlag);      // Error: Property 'unknownFlag' does not exist
// console.log(perms.getFlag('oops'));  // Error: Argument of type '"oops"' is not assignable

// Working with the flags object (type-safe iteration)
const allFlags = perms.getFlagNames();  // Returns ['admin', 'editor', 'viewer']
allFlags.forEach(flag => {
  console.log(`${flag}: ${perms.getFlag(flag)}`);  // Type-safe access
});

// Deprecated approach (still works but not recommended)
// const oldFlags = perms.getFlags();  // Deprecated: Use getFlagNames() instead
```

## API Reference

### Factory Function

#### `createByteFlags<T extends string>(...flagNames: T[]): ByteFlagsWithFlags<T>`

Creates a new ByteFlags instance with type-safe flag names (up to 8).

**Parameters:**
- `...flagNames` - Names of the flags to create (1-8 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `ByteFlagsWithFlags<T>` - A new ByteFlags instance with type-safe flag access

**Throws:**
- `Error` - If more than 8 flags are provided, if duplicate flag names are given, or if flag names are not strings

### Constructor

#### `new ByteFlags(...flagNames: string[]): ByteFlags`

Creates a new ByteFlags instance with the specified flag names (up to 8).

**Parameters:**
- `...flagNames` - Names of the flags to create (1-8 flags)

**Throws:**
- `Error` - If more than 8 flags are provided, if duplicate flag names are given, or if flag names are not strings

### Instance Methods

#### `getFlag(name: string): boolean`
Gets the value of a flag by name.

#### `setFlag(name: string, value: boolean): this`
Sets the value of a flag by name.

#### `toggleFlag(name: string): this`
Toggles the value of a flag (`true` becomes `false`, `false` becomes `true`).

#### `any(): boolean`
Checks if any flag is set to `true`.

#### `none(): boolean`
Checks if no flags are set to `true` (all flags are `false`).

#### `hasFlag(name: string): boolean`
Checks if a flag exists in this ByteFlags instance.

#### `getFlagNames(): string[]`
Gets all flag names in the order they were defined.

#### `getFlags(): string[]`
**⚠️ Deprecated**: Use `getFlagNames()` instead for better clarity. This method will be removed in a future version.

Gets all flag names in the order they were defined.

#### `getFlagNames(): string[]`
Gets all flag names in the order they were defined. (Preferred over `getFlags`)

#### `setFlags(flags: Record<string, boolean>): this`
Sets multiple flags at once using an object of flag names and their values.

#### `toggleFlags(...names: string[]): this`
Toggles multiple flags at once.

#### `all(...names: string[]): boolean`
Checks if all specified flags are `true`.

#### `anyOf(...names: string[]): boolean`
Checks if any of the specified flags are `true`.

#### `noneOf(...names: string[]): boolean`
Checks if none of the specified flags are `true`.

#### `count(): number`
Returns the number of flags that are currently set to `true`.

#### `size(): number`
Returns the total number of flags defined.

#### `any(): boolean`
Returns `true` if any flag is set to `true`.

#### `none(): boolean`
Returns `true` if no flags are set to `true`.

#### `reset(): this`
Sets all flags to `false`.

#### `setAll(): this`
Sets all flags to `true`.

#### `toJSON(): Record<string, boolean>`
Converts the flags to a plain object for JSON serialization.

#### `[Symbol.iterator](): IterableIterator<[string, boolean]>`
Allows iteration over the flags using `for...of`.

#### `toByte(): number`
Converts the flags to a byte value (0-255).

#### `fromByte(byte: number): this`
Loads flags from a byte value.

**Parameters:**
- `byte` - Byte value (0-255) to load

**Returns:** `this` - The instance for method chaining

**Throws:**
- `Error` - If the byte value is invalid

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications").fromByte(3); // (binary: 00000011)

console.log(features.toObject()); // { isDarkMode: true, hasNotifications: true }
```

#### `toObject(): Record<string, boolean>`

Converts the flags to a plain JavaScript object.

**Returns:** `Record<string, boolean>` - Object with flag names as keys and boolean values

**Example:**

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications");

features.isDarkMode = true;

console.log(features.toObject()); // { isDarkMode: true, hasNotifications: false }
```

## Memory and Performance

### Runtime vs. Storage Trade-off

ByteFlags is designed with a clear trade-off: it uses more memory during runtime to enable minimal storage requirements when persisted.

**Runtime (in-memory):**
- **Base overhead**: ~160-200 bytes per instance (for class instance, flag metadata, and property descriptors)
- **Flag storage**: Only 1 byte total for up to 8 flags (1 bit per flag)
- **Example (1M users)**:
  - 1,000,000 users × ~180 bytes overhead = ~180MB RAM
  - Plus 1,000,000 users × 1 byte per user = 1MB for flag storage
  - **Total**: ~181MB RAM

**Storage/Network (serialized):**
- **1 byte per user** (all 8 flags packed into a single byte)
- **8x smaller** than storing booleans individually (1 byte per boolean)
- **Example (1M users)**:
  - 1,000,000 users × 1 byte = **1MB** total
  - Compared to: 1,000,000 users × 8 booleans × 1 byte each = 8MB (using individual booleans)

### Key Benefits

1. **Database Efficiency**
   - Store millions of flag sets in minimal space
   - Faster backups and restores
   - Reduced cloud storage costs

2. **Network Optimization**
   - 8x smaller payloads over the wire
   - Faster data synchronization
   - Lower bandwidth costs at scale

### Performance Characteristics

- **Memory**: Optimized for serialized size, not runtime footprint
- **CPU**: Minimal overhead for bitwise operations
- **Operations**: O(1) for all operations (get/set/toggle)
- **Serialization**: Near-instant `toByte()` and `fromByte()`

## Use Cases
- User preferences and settings
- Feature flags and A/B testing
- Status tracking and permissions
- Any scenario requiring compact boolean storage

## Limitations
1. Maximum of 8 boolean flags (1 byte)
2. Flag names are case-sensitive and immutable after creation
3. Order of flags affects the byte representation

## License

MIT
