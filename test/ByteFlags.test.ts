import { ByteFlags, createByteFlags } from "../src/ByteFlags";

describe("ByteFlags", () => {
  it("constructs with valid flag names", () => {
    const flags = new ByteFlags("f0", "f1", "f2");
    expect(flags.getFlagNames()).toEqual(["f0", "f1", "f2"]);
  });

  it("throws if more than 8 flags", () => {
    expect(
      () => new ByteFlags("f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8")
    ).toThrow();
  });

  it("throws if no flags", () => {
    expect(() => new ByteFlags()).toThrow();
  });

  it("throws on duplicate flag names", () => {
    expect(() => new ByteFlags("f0", "f0")).toThrow();
  });

  it("sets and gets flags by name", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlag("f0", true);
    expect(flags.getFlag("f0")).toBe(true);
    expect(flags.getFlag("f1")).toBe(false);
  });

  it("toggles flags", () => {
    const flags = new ByteFlags("f0");
    flags.setFlag("f0", false);
    flags.toggleFlag("f0");
    expect(flags.getFlag("f0")).toBe(true);
    flags.toggleFlag("f0");
    expect(flags.getFlag("f0")).toBe(false);
  });

  it("throws on get/set/toggle unknown flag", () => {
    const flags = new ByteFlags("f0");
    expect(() => flags.getFlag("nope")).toThrow();
    expect(() => flags.setFlag("nope", true)).toThrow();
    expect(() => flags.toggleFlag("nope")).toThrow();
  });

  it("direct property access works", () => {
    const flags = new ByteFlags("foo", "bar");
    (flags as any).foo = true;
    expect(flags.getFlag("foo")).toBe(true);
    (flags as any).bar = false;
    expect(flags.getFlag("bar")).toBe(false);
    expect((flags as any).foo).toBe(true);
    expect((flags as any).bar).toBe(false);
  });

  it("hasFlag works", () => {
    const flags = new ByteFlags("f0", "f1");
    expect(flags.hasFlag("f0")).toBe(true);
    expect(flags.hasFlag("f1")).toBe(true);
    expect(flags.hasFlag("f2")).toBe(false);
  });

  it("setFlags and toObject", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    expect(flags.toObject()).toEqual({ f0: true, f1: false });
  });

  it("toggleFlags", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlags({ f0: false, f1: false });
    flags.toggleFlags("f0", "f1");
    expect(flags.getFlag("f0")).toBe(true);
    expect(flags.getFlag("f1")).toBe(true);
  });

  it("count, any, none", () => {
    const flags = new ByteFlags("f0", "f1", "f2");
    expect(flags.count()).toBe(0);
    expect(flags.any()).toBe(false);
    expect(flags.none()).toBe(true);
    flags.setFlag("f0", true);
    expect(flags.count()).toBe(1);
    expect(flags.any()).toBe(true);
    expect(flags.none()).toBe(false);
  });

  it("toByte and fromByte", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const byte = flags.toByte();
    expect(typeof byte).toBe("number");
    const newFlags = new ByteFlags("f0", "f1");
    newFlags.fromByte(byte);
    expect(newFlags.toObject()).toEqual({ f0: true, f1: false });
  });

  it("throws on invalid fromByte", () => {
    const flags = new ByteFlags("f0");
    expect(() => flags.fromByte(-1)).toThrow();
    expect(() => flags.fromByte(256)).toThrow();
    expect(() => flags.fromByte(1.5)).toThrow();
  });

  it("toJSON and fromJSON", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const json = flags.toJSON();
    const restored = ByteFlags.fromJSON(json);
    expect(restored.toObject()).toEqual({ f0: true, f1: false });
  });

  it("fromJSON works for both string and object, and throws only for >8 flags or invalid JSON", () => {
    // Accepts string
    const jsonString = JSON.stringify({ foo: true, bar: false });
    const fromString = ByteFlags.fromJSON(jsonString);
    expect(fromString.getFlagNames()).toEqual(["foo", "bar"]);
    expect(fromString.toObject()).toEqual({ foo: true, bar: false });

    // Accepts object
    const jsonObj = { f0: true, f1: false };
    const fromObj = ByteFlags.fromJSON(jsonObj);
    expect(fromObj.getFlagNames()).toEqual(["f0", "f1"]);
    expect(fromObj.toObject()).toEqual({ f0: true, f1: false });

    // Throws for >8 flags
    const tooMany = {
      f0: true,
      f1: true,
      f2: true,
      f3: true,
      f4: true,
      f5: true,
      f6: true,
      f7: true,
      f8: true,
    };
    expect(() => ByteFlags.fromJSON(tooMany)).toThrow();
    // String case
    expect(() => ByteFlags.fromJSON(JSON.stringify(tooMany))).toThrow();

    // Throws for invalid JSON string
    expect(() => ByteFlags.fromJSON("not a json")).toThrow();
  });

  it("all, anyOf, noneOf", () => {
    const flags = new ByteFlags("f0", "f1", "f2");
    flags.setFlags({ f0: true, f1: false, f2: true });
    expect(flags.all("f0", "f2")).toBe(true);
    expect(flags.all("f0", "f1")).toBe(false);
    expect(flags.anyOf("f1", "f2")).toBe(true);
    expect(flags.anyOf("f1")).toBe(false);
    expect(flags.noneOf("f1")).toBe(true);
    expect(flags.noneOf("f0", "f2")).toBe(false);
  });

  it("iterator and toString", () => {
    const flags = new ByteFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const entries = Array.from(flags);
    expect(entries).toEqual([
      ["f0", true],
      ["f1", false],
    ]);
    expect(flags.toString()).toContain("f0=true");
    expect(flags.toString()).toContain("f1=false");
  });

  it("getFlagNames and getFlags return all flag names", () => {
    const flags = new ByteFlags("f0", "f1", "f2");
    expect(flags.getFlagNames()).toEqual(["f0", "f1", "f2"]);
    // Deprecated method
    expect(flags.getFlags()).toEqual(["f0", "f1", "f2"]);
  });

  it("createByteFlags returns type-safe instance", () => {
    const flags = createByteFlags("foo", "bar");
    flags.foo = true;
    flags.bar = false;
    expect(flags.foo).toBe(true);
    expect(flags.bar).toBe(false);
  });
});
