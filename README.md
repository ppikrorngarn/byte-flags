# ByteFlags

A lightweight, type-safe utility class for efficiently storing and managing up to 8 boolean flags in a single byte (8 bits). Ideal for permission systems, feature flags, status tracking, and any scenario requiring compact boolean storage.

## Features

- **Memory Efficient**: Stores up to 8 boolean flags in a single byte

- **Type-Safe**: Full TypeScript support with type checking

- **Immutable Flag Names**: Flag names are fixed at creation time for type safety

- **Multiple Access Methods**: Use property access or method calls

- **Serialization**: Easily convert to/from a single byte for storage

- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash

npm install  @piyawasin/byte-flags

```

## Basic Usage

```typescript
import { ByteFlags } from "@piyawasin/byte-flags";

// Create a new ByteFlags instance with some flags

const flags = new ByteFlags("isAdmin", "hasAccess", "isVerified");

// Set flag values

flags.setFlag("isAdmin", true);

flags.isVerified = true; // Direct property access works too!

// Get flag values

console.log(flags.isAdmin); // true

console.log(flags.getFlag("hasAccess")); // false

// Toggle a flag

flags.toggleFlag("hasAccess");

console.log(flags.hasAccess); // true

// Convert to byte for storage

const byteValue = flags.toByte();

console.log(byteValue); // 5 (binary: 00000101)

// Later, restore from byte

const restoredFlags = new ByteFlags(
  "isAdmin",
  "hasAccess",
  "isVerified"
).fromByte(byteValue);
```

## API Reference

### Constructor

#### `new ByteFlags(...flagNames: string[]): ByteFlags`

Creates a new ByteFlags instance with the specified flag names (up to 8). Once created, the flag names cannot be modified, ensuring type safety.

**Parameters:**

- `...flagNames` - Names of the flags to create (1-8 flags)

**Throws:**

- `Error` - If more than 8 flags are provided, if duplicate flag names are given, or if flag names are not strings

**Note:** Flag names are case-sensitive and must be valid JavaScript property names.

**Example:**

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications");
```

### Instance Properties

#### `{flagName}: boolean`

Direct property access to get/set flag values. Property names match the flag names provided in the constructor.

**Example:**

```typescript
const features = new ByteFlags("isDarkMode");

features.isDarkMode = true; // Set value

console.log(features.isDarkMode); // true
```

### Instance Methods

#### `getFlag(name: string): boolean`

Gets the value of a flag by name.

**Parameters:**

- `name` - The name of the flag to get

**Returns:** `boolean` - The current value of the flag

**Throws:**

- `Error` - If the flag doesn't exist

**Example:**

```typescript
const features = new ByteFlags("isDarkMode");

console.log(features.getFlag("isDarkMode")); // false
```

#### `setFlag(name: string, value: boolean): this`

Sets the value of a flag by name.

**Parameters:**

- `name` - The name of the flag to set

- `value` - The boolean value to set

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the flag doesn't exist

**Example:**

```typescript
const features = new ByteFlags("isDarkMode");

features.setFlag("isDarkMode", true);
```

#### `toggleFlag(name: string): this`

Toggles the value of a flag (`true` becomes `false`, `false` becomes `true`).

**Parameters:**

- `name` - The name of the flag to toggle

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the flag doesn't exist

**Example:**

```typescript
const features = new ByteFlags("isDarkMode");

features.toggleFlag("isDarkMode"); // false -> true

features.toggleFlag("isDarkMode"); // true -> false
```

#### `hasFlag(name: string): boolean`

Checks if a flag exists in this ByteFlags instance.

**Parameters:**

- `name` - The name of the flag to check

**Returns:** `boolean` - True if the flag exists, false otherwise

**Example:**

```typescript
const features = new ByteFlags("isDarkMode");

console.log(features.hasFlag("isDarkMode")); // true

console.log(features.hasFlag("nonexistent")); // false
```

#### `getFlags(): string[]`

Gets all flag names in this ByteFlags instance.

**Returns:** `string[]` - Array of flag names in the order they were defined

**Example:**

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications");

console.log(features.getFlags()); // ['isDarkMode', 'hasNotifications']
```

#### `toByte(): number`

Converts the flags to a byte value (0-255).

**Returns:** `number` - Byte representation of all flags (0-255)

**Example:**

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications");

features.isDarkMode = true;

console.log(features.toByte()); // 1 (binary: 00000001)
```

#### `toObject(): Record<string, boolean>`

Converts the flags to a plain JavaScript object with flag names as keys and their current values.

**Returns:** `Record<string, boolean>` - Object mapping flag names to their boolean values

**Example:**

```typescript
const features = new ByteFlags("isDarkMode", "hasNotifications");

features.isDarkMode = true;

console.log(features.toObject()); // { isDarkMode: true, hasNotifications: false }
```

#### `fromByte(byte: number): this`

Loads flags from a byte value.

**Parameters:**

- `byte` - Byte value (0-255) to load

**Returns:** `this` - The instance for method chaining

**Throws:**

- `Error` - If the byte value is invalid

**Example:**

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

3. **Ideal Use Cases**
   - User preferences and settings
   - Feature flags and A/B testing
   - Status tracking and permissions
   - Anywhere compact boolean storage is needed

### Performance Characteristics

- **Memory**: Optimized for serialized size, not runtime footprint
- **CPU**: Minimal overhead for bitwise operations
- **Operations**: O(1) for all operations (get/set/toggle)
- **Serialization**: Near-instant `toByte()` and `fromByte()`

## Limitations

- Maximum of 8 boolean flags (1 byte)

- Flag names are case-sensitive

- Flag names cannot be changed after creation

## Examples

### Basic Usage

```typescript
// 1. Create a new instance with feature flags

const features = new ByteFlags(
  "isDarkMode",
  "hasNotifications",
  "isAnalyticsEnabled"
);

// 2. Set flag values using property access or setFlag()

features.isDarkMode = true; // Direct property access

features.setFlag("hasNotifications", true); // Using setFlag method

// 3. Get flag values

console.log(features.isDarkMode); // true

console.log(features.hasNotifications); // true

console.log(features.isAnalyticsEnabled); // false

// 4. Toggle a flag

features.toggleFlag("isAnalyticsEnabled");

console.log(features.isAnalyticsEnabled); // true

// 5. Convert to a single byte for storage

const savedByte = features.toByte();

console.log(savedByte); // 7 (binary: 00000111)

// 6. Restore from byte

const restored = new ByteFlags(
  "isDarkMode",
  "hasNotifications",
  "isAnalyticsEnabled"
).fromByte(savedByte);

// 7. Convert to/from plain object

const settings = features.toObject(); // { isDarkMode: true, hasNotifications: true, isAnalyticsEnabled: true }
```

## Type Safety

ByteFlags leverages TypeScript's type system to provide type safety when working with flags. When you create a ByteFlags instance, the flag names are tracked in the type system, providing autocompletion and type checking.

```typescript
const flags = new ByteFlags("isDarkMode", "hasNotifications");

// TypeScript will show an error for non-existent flags

flags.getFlag("isLightMode"); // Error: Argument of type '"isLightMode"' is not assignable to parameter of type '"isDarkMode" | "hasNotifications"'.

// Only these work:
flags.getFlag("isDarkMode"); // OK
flags.getFlag("hasNotifications"); // OK
```

## Performance

ByteFlags is designed for high performance:

- **Memory Efficient**: Stores up to 8 flags in a single byte

- **Fast Operations**: All operations are O(1) constant time

- **Minimal Overhead**: Direct bit manipulation for maximum speed

## Limitations

1.  **Maximum 8 Flags**: Limited by single-byte storage (8 bits)

2.  **Immutable Flag Names**: Cannot add or remove flags after creation

3.  **No Flag Metadata**: Only stores boolean values, no additional metadata per flag

4.  **Order Matters**: The order of flags affects the byte representation

## License

MIT
