# byte-flags

A lightweight, type-safe utility library for efficiently storing and managing boolean flags in compact numeric values. Ideal for permission systems, feature flags, status tracking, and any scenario requiring compact boolean storage.

## 🚨 BREAKING CHANGES IN v2.0.0 🚨

Originally, this library was designed for managing only 8 boolean flags in a single byte (hence the original name "ByteFlags").

Version 2.0.0 expands the library's capabilities by introducing a new class hierarchy with three flag types for different storage capacities:

- **ByteFlags**: Up to 8 flags in a single byte (8-bit value)
- **ShortFlags**: Up to 16 flags in a short (16-bit value)
- **LongFlags**: Up to 32 flags in a long (32-bit value)

All types share mostly the same interface and behavior, just with different storage capacities.

## Features

- **Flexible Storage Options**:
  - **ByteFlags**: Store up to 8 flags in a single byte (8-bit value)
  - **ShortFlags**: Store up to 16 flags in a short (16-bit value)
  - **LongFlags**: Store up to 32 flags in a long (32-bit value)
- **Type-Safe**: Full TypeScript support with type checking
- **Immutable Flag Names**: Flag names are fixed at creation time for type safety
- **Multiple Access Methods**: Use property access or method calls
- **Bulk Operations**: Set/toggle multiple flags at once
- **Combination Checks**: Check multiple flags in a single call
- **Serialization**: Convert to/from numeric values or JSON
- **Iterable**: Use `for...of` to loop through flags
- **Consistent API**: Same interface across all flag types
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install @piyawasin/byte-flags
```

## Basic Usage

### Choosing the Right Flag Type

Choose the appropriate flag type based on how many flags you need:

| Flag Type  | Max Flags | Storage Size      |
| ---------- | --------- | ----------------- |
| ByteFlags  | 8         | 1 byte (8 bits)   |
| ShortFlags | 16        | 2 bytes (16 bits) |
| LongFlags  | 32        | 4 bytes (32 bits) |

### Creating Instances

You can create a new flags instance using the appropriate creation function (recommended) or constructor:

```typescript
import {
  ByteFlags,
  createByteFlags,
  ShortFlags,
  createShortFlags,
  LongFlags,
  createLongFlags,
} from "@piyawasin/byte-flags";

// ByteFlags (up to 8 flags)
const permissions = createByteFlags("read", "write", "execute", "admin");

// ShortFlags (up to 16 flags)
const userFlags = createShortFlags(
  "isActive",
  "isVerified",
  "hasPaid",
  "isAdmin",
  "hasMfa",
  "isLocked",
  "hasProfile",
  "hasAvatar",
  "acceptedTerms",
  "newsletter"
);

// LongFlags (up to 32 flags)
const featureFlags = createLongFlags(
  "darkMode",
  "pushNotifications",
  "emailNotifications",
  "betaFeatures",
  "advancedStats",
  "customThemes",
  "autoBackup",
  "publicProfile",
  "twoFactorAuth",
  "apiAccess",
  "developerMode",
  "dataExport",
  "analyticsEnabled",
  "externalIntegrations",
  "premiumSupport",
  "collaboration",
  "advancedSearch",
  "bulkOperations",
  "customReports",
  "autoSave"
);
```

For TypeScript users, you can also use explicit types for better type safety:

```typescript
// With explicit type for better type safety
type PermissionFlags = "read" | "write" | "execute" | "admin";
const permissions = createByteFlags<PermissionFlags>("read", "write", "admin");

type FeatureFlags = "darkMode" | "notifications" | "analytics";
const features = createShortFlags<FeatureFlags>("darkMode", "notifications");

// Using constructors (less recommended)
const settings = new LongFlags("option1", "option2", "option3");
```

> **Note**: The `create*Flags` functions are preferred as they provide better type inference and cleaner syntax.

### Working with Flags

All flag types (ByteFlags, ShortFlags, LongFlags) share the same API and can be used in exactly the same way:

```typescript
import {
  createByteFlags,
  createShortFlags,
  createLongFlags,
} from "@piyawasin/byte-flags";

// Examples work with ANY flag type (ByteFlags, ShortFlags, or LongFlags)
const flags = createByteFlags("read", "write", "execute", "admin");
// const flags = createShortFlags("read", "write", "execute", "admin");
// const flags = createLongFlags("read", "write", "execute", "admin");

// Set flag values using property access
flags.read = true;
flags.write = true;

// Or using method access
flags.setFlag("admin", true);

// Set multiple flags at once
flags.setFlags({
  execute: true,
  admin: false,
});

// Get flag values using property access
console.log(flags.read); // true

// Or using method access
console.log(flags.getFlag("write")); // true

// Toggle flags
flags.toggleFlag("execute"); // Toggle a single flag
flags.toggleFlags("read", "admin"); // Toggle multiple flags

// Check multiple flags
if (flags.all("read", "write")) {
  console.log("User has both read and write access");
}

if (flags.anyOf("guest", "admin")) {
  console.log("User is either a guest or admin");
}

if (flags.noneOf("blocked", "deleted")) {
  console.log("User is not blocked or deleted");
}

// Count set flags
console.log(`${flags.count()} out of ${flags.size()} flags are set`);

// Serialization (specific to flag type)

// ByteFlags: Convert to/from byte value (8-bit)
const byteFlags = createByteFlags("read", "write", "execute", "admin");
byteFlags.read = true;
byteFlags.write = true;
const byteValue = byteFlags.toByte();
const restoredByte = createByteFlags(
  "read",
  "write",
  "execute",
  "admin"
).fromByte(byteValue);

// ShortFlags: Convert to/from short value (16-bit)
const shortFlags = createShortFlags("option1", "option2", "option3");
shortFlags.option1 = true;
const shortValue = shortFlags.toShort();
const restoredShort = createShortFlags(
  "option1",
  "option2",
  "option3"
).fromShort(shortValue);

// LongFlags: Convert to/from long value (32-bit)
const longFlags = createLongFlags("feature1", "feature2", "feature3");
longFlags.feature1 = true;
const longValue = longFlags.toLong();
const restoredLong = createLongFlags(
  "feature1",
  "feature2",
  "feature3"
).fromLong(longValue);

// JSON serialization (works with all flag types)
const json = JSON.stringify(flags); // Uses toJSON() automatically

// For ByteFlags
const fromByteJson = ByteFlags.fromJSON(JSON.parse(json));
// For ShortFlags
const fromShortJson = ShortFlags.fromJSON(JSON.parse(json));
// For LongFlags
const fromLongJson = LongFlags.fromJSON(JSON.parse(json));

// Iterate over flags (works with all types)
for (const [name, isSet] of flags) {
  console.log(`${name}: ${isSet}`);
}

// Get all flag names (works with all types)
const flagNames = flags.getFlagNames(); // Get all flag names as an array
// const oldWay = flags.getFlags();     // Deprecated: Use getFlagNames() instead

// Reset all flags (works with all types)
flags.reset(); // Set all flags to false
flags.setAll(); // Set all flags to true
```

## Type Safety with TypeScript

For advanced type safety in function returns, you can use the appropriate type-safe return type:

```typescript
import {
  type ByteFlagsWithFlags,
  createByteFlags,
  type ShortFlagsWithFlags,
  createShortFlags,
  type LongFlagsWithFlags,
  createLongFlags,
} from "@piyawasin/byte-flags";

// For ByteFlags (up to 8 flags)
type SmallPermissions = "read" | "write" | "execute" | "admin";

function createBasicPermissions(): ByteFlagsWithFlags<SmallPermissions> {
  return createByteFlags<SmallPermissions>("read", "write", "execute", "admin");
}

// For ShortFlags (up to 16 flags)
type MediumPermissions =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "moderate"
  | "admin"
  | "guest";

function createAdvancedPermissions(): ShortFlagsWithFlags<MediumPermissions> {
  return createShortFlags<MediumPermissions>(
    "create",
    "read",
    "update",
    "delete",
    "publish",
    "unpublish",
    "moderate",
    "admin",
    "guest"
  );
}

// For LongFlags (up to 32 flags)
type AppFeatures =
  | "darkMode"
  | "notifications"
  | "analytics"
  | "advancedSearch"
  | "customThemes"
  | "autoBackup"
  | "publicProfile"
  | "apiAccess";

function createFeatureFlags(): LongFlagsWithFlags<AppFeatures> {
  return createLongFlags<AppFeatures>(
    "darkMode",
    "notifications",
    "analytics",
    "advancedSearch",
    "customThemes",
    "autoBackup",
    "publicProfile",
    "apiAccess"
  );
}

// Using the type-safe instances
const perms = createBasicPermissions();

// Property access (type-safe)
perms.admin = true;
console.log(perms.admin); // true

// Method access (type-safe)
perms.setFlag("read", true);
console.log(perms.getFlag("read")); // true

// perms.unknown = true;                // Error: Property 'unknown' does not exist
// perms.setFlag('unknown', true);      // Error: Argument of type '"unknown"' is not assignable
// console.log(perms.unknownFlag);      // Error: Property 'unknownFlag' does not exist
// console.log(perms.getFlag('oops'));  // Error: Argument of type '"oops"' is not assignable

// Working with the flags object (type-safe iteration)
const allFlags = perms.getFlagNames(); // Returns ['admin', 'editor', 'viewer']
allFlags.forEach((flag) => {
  console.log(`${flag}: ${perms.getFlag(flag)}`); // Type-safe access
});

// Deprecated approach (still works but not recommended)
// const oldFlags = perms.getFlags();  // Deprecated: Use getFlagNames() instead
```

## API Reference

### Factory Functions

#### `createByteFlags<T extends string = string>(...flagNames: string[]): ByteFlagsWithFlags<T>`

Creates a new ByteFlags instance with type-safe property access.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-8 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `ByteFlagsWithFlags<T>` - A new ByteFlags instance with type-safe flag access

**Throws:**

- `Error` - If more than 8 flags are provided, if duplicate flag names are given, or if flag names are not strings

#### `createShortFlags<T extends string = string>(...flagNames: string[]): ShortFlagsWithFlags<T>`

Creates a new ShortFlags instance with type-safe property access.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-16 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `ShortFlagsWithFlags<T>` - A new ShortFlags instance with type-safe flag access

**Throws:**

- `Error` - If more than 16 flags are provided, if duplicate flag names are given, or if flag names are not strings

#### `createLongFlags<T extends string = string>(...flagNames: string[]): LongFlagsWithFlags<T>`

Creates a new LongFlags instance with type-safe property access.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-32 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `LongFlagsWithFlags<T>` - A new LongFlags instance with type-safe flag access

**Throws:**

- `Error` - If more than 32 flags are provided, if duplicate flag names are given, or if flag names are not strings

### Constructors

#### `new ByteFlags(...flagNames: string[]): ByteFlags`

Creates a new ByteFlags instance for managing up to 8 boolean flags.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-8 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `ByteFlags` - A new ByteFlags instance

**Throws:**

- `Error` - If more than 8 flags are provided, if duplicate flag names are given, or if flag names are not strings

#### `new ShortFlags(...flagNames: string[]): ShortFlags`

Creates a new ShortFlags instance for managing up to 16 boolean flags.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-16 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `ShortFlags` - A new ShortFlags instance

**Throws:**

- `Error` - If more than 16 flags are provided, if duplicate flag names are given, or if flag names are not strings

#### `new LongFlags(...flagNames: string[]): LongFlags`

Creates a new LongFlags instance for managing up to 32 boolean flags.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-32 flags, case-sensitive, must be valid JavaScript property names)

**Returns:** `LongFlags` - A new LongFlags instance

**Throws:**

- `Error` - If more than 32 flags are provided, if duplicate flag names are given, or if flag names are not strings

### Common Methods (Available on All Flag Types)

The following methods are available on all flag types (ByteFlags, ShortFlags, and LongFlags):

#### `hasFlag(name: string): boolean`

Checks if a flag exists in this instance.

#### `getFlag(name: string): boolean`

Gets the value of a flag by name.

#### `setFlag(name: string, value: boolean): this`

Sets the value of a flag by name.

#### `toggleFlag(name: string): this`

Toggles the value of a flag (`true` becomes `false`, `false` becomes `true`).

#### `getFlags(): string[]`

Gets all flag names in the order they were defined. (Deprecated - use `getFlagNames()` instead)

#### `getFlagNames(): string[]`

Gets all flag names in the order they were defined.

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

#### `toObject(): Record<string, boolean>`

Converts the flags to a plain JavaScript object.

#### `[Symbol.iterator](): IterableIterator<[string, boolean]>`

Allows iteration over the flags using `for...of`.

### Class-Specific Methods

#### ByteFlags Methods

#### `toByte(): number`

Converts the flags to a byte value (0-255).

**Returns:** `number` - An 8-bit integer representing the flag states

#### `fromByte(byte: number): this`

Loads flags from a byte value.

**Parameters:**

- `byte` - Byte value (0-255) to load

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the byte value is invalid

```typescript
const features = createByteFlags("read", "write").fromByte(3); // (binary: 00000011)
console.log(features.toObject()); // { read: true, write: true }
```

#### `static fromJSON(json: string | object): ByteFlags`

Creates a ByteFlags instance from a JSON string or object.

**Parameters:**

- `json` - JSON string or object from toJSON()

**Returns:** `ByteFlags` - A new ByteFlags instance

**Throws:**

- `Error` - If JSON is invalid or flags don't match

#### ShortFlags Methods

#### `toShort(): number`

Converts the flags to a short value (0-65535).

**Returns:** `number` - A 16-bit integer representing the flag states

#### `fromShort(short: number): this`

Loads flags from a short value.

**Parameters:**

- `short` - Short value (0-65535) to load

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the short value is invalid

```typescript
const features = createShortFlags("read", "write", "execute").fromShort(7); // (binary: 0000000000000111)
console.log(features.toObject()); // { read: true, write: true, execute: true }
```

#### `static fromJSON(json: string | object): ShortFlags`

Creates a ShortFlags instance from a JSON string or object.

**Parameters:**

- `json` - JSON string or object from toJSON()

**Returns:** `ShortFlags` - A new ShortFlags instance

**Throws:**

- `Error` - If JSON is invalid or flags don't match

#### LongFlags Methods

#### `toLong(): number`

Converts the flags to a long value (0-4294967295).

**Returns:** `number` - A 32-bit integer representing the flag states

#### `fromLong(long: number): this`

Loads flags from a long value.

**Parameters:**

- `long` - Long value (0-4294967295) to load

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the long value is invalid

```typescript
const features = createLongFlags("read", "write", "execute", "admin").fromLong(
  15
); // (binary: 00000000000000000000000000001111)
console.log(features.toObject()); // { read: true, write: true, execute: true, admin: true }
```

#### `static fromJSON(json: string | object): LongFlags`

Creates a LongFlags instance from a JSON string or object.

**Parameters:**

- `json` - JSON string or object from toJSON()

**Returns:** `LongFlags` - A new LongFlags instance

**Throws:**

- `Error` - If JSON is invalid or flags don't match

## Memory and Performance

### Runtime vs. Storage Trade-off

The flags classes are designed with a clear trade-off: they use more memory during runtime to enable minimal storage requirements when persisted.

**Runtime (in-memory):**

- **Base overhead**: ~160-200 bytes per instance (for class instance, flag metadata, and property descriptors)
- **Flag storage**:
  - ByteFlags: Only 1 byte total for up to 8 flags (1 bit per flag)
  - ShortFlags: Only 2 bytes total for up to 16 flags (1 bit per flag)
  - LongFlags: Only 4 bytes total for up to 32 flags (1 bit per flag)
- **Examples (1M users):**
  - **ByteFlags**:
    - 1,000,000 users × ~180 bytes overhead = ~180MB RAM
    - Plus 1,000,000 users × 1 byte per user = 1MB for flag storage
    - **Total**: ~181MB RAM
  - **ShortFlags**:
    - 1,000,000 users × ~180 bytes overhead = ~180MB RAM
    - Plus 1,000,000 users × 2 bytes per user = 2MB for flag storage
    - **Total**: ~182MB RAM
  - **LongFlags**:
    - 1,000,000 users × ~180 bytes overhead = ~180MB RAM
    - Plus 1,000,000 users × 4 bytes per user = 4MB for flag storage
    - **Total**: ~184MB RAM

**Storage/Network (serialized):**

- **ByteFlags**: 1 byte per instance (all 8 flags packed into a single byte)
- **ShortFlags**: 2 bytes per instance (all 16 flags packed into a two bytes)
- **LongFlags**: 4 bytes per instance (all 32 flags packed into four bytes)
- **Example (1M users):**
  - ByteFlags: 1,000,000 users × 1 byte = **1MB** total (vs. 8MB for individual booleans)
  - ShortFlags: 1,000,000 users × 2 bytes = **2MB** total (vs. 16MB for individual booleans)
  - LongFlags: 1,000,000 users × 4 bytes = **4MB** total (vs. 32MB for individual booleans)

### Key Benefits

1. **Database Efficiency**

   - Store millions of flag sets in minimal space
   - Faster backups and restores
   - Reduced cloud storage costs

2. **Network Optimization**

   - Up to 32x smaller payloads over the wire
   - Faster data synchronization
   - Lower bandwidth costs at scale

3. **Flexible Storage Options**
   - Choose the right size for your needs
   - ByteFlags: Ultra-compact for 1-8 flags
   - ShortFlags: Balanced for 9-16 flags
   - LongFlags: Expansive for 17-32 flags

### Performance Characteristics

- **Memory**: Optimized for serialized size, not runtime footprint
- **CPU**: Minimal overhead for bitwise operations
- **Operations**: O(1) for all operations (get/set/toggle)
- **Serialization**: Near-instant conversion to/from numeric values

## Use Cases

- User preferences and settings
- Feature flags and A/B testing
- Status tracking and permissions
- Application state management
- Configuration flags
- Any scenario requiring compact boolean storage

## Limitations

1. Maximum number of flags per instance:
   - ByteFlags: 8 flags (1 byte)
   - ShortFlags: 16 flags (2 bytes)
   - LongFlags: 32 flags (4 bytes)
2. A true 64-bit flag system is not implemented due to JavaScript's `Number.MAX_SAFE_INTEGER` (2^53-1) limitation, which prevents safely handling integers beyond that range. While BigInt could be used, it would require significant changes to the API.
3. It's worth noting that JavaScript already uses memory for each number (64-bit IEEE 754 floating-point), so using these flag classes doesn't actually save memory during JavaScript runtime - this implementation is primarily for fun and educational purposes.
4. However, these classes DO significantly save memory when reading/writing from databases or transmitting over networks, as the data is stored in compact numeric form.
5. Flag names are case-sensitive and immutable after creation
6. Order of flags affects the numeric representation

## License

MIT
