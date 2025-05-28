import { LongFlags, createLongFlags } from "../src/LongFlags";

describe("LongFlags", () => {
  it("constructs with valid flag names", () => {
    const flags = new LongFlags("f0", "f1", "f2");
    expect(flags.getFlagNames()).toEqual(["f0", "f1", "f2"]);
  });

  it("throws if more than 32 flags", () => {
    // Create an array of 33 flag names (exceeding the 32 flag limit)
    const tooManyFlags = Array.from({ length: 33 }, (_, i) => `f${i}`);
    expect(() => new LongFlags(...tooManyFlags)).toThrow();
  });

  it("allows exactly 32 flags", () => {
    // Create an array of 32 flag names (maximum allowed)
    const maxFlags = Array.from({ length: 32 }, (_, i) => `f${i}`);
    const flags = new LongFlags(...maxFlags);
    expect(flags.getFlagNames().length).toBe(32);
  });

  it("throws if no flags", () => {
    expect(() => new LongFlags()).toThrow();
  });

  it("throws on duplicate flag names", () => {
    expect(() => new LongFlags("f0", "f0")).toThrow();
  });

  it("sets and gets flags by name", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlag("f0", true);
    expect(flags.getFlag("f0")).toBe(true);
    expect(flags.getFlag("f1")).toBe(false);
  });

  it("toggles flags", () => {
    const flags = new LongFlags("f0");
    flags.setFlag("f0", false);
    flags.toggleFlag("f0");
    expect(flags.getFlag("f0")).toBe(true);
    flags.toggleFlag("f0");
    expect(flags.getFlag("f0")).toBe(false);
  });

  it("throws on get/set/toggle unknown flag", () => {
    const flags = new LongFlags("f0");
    expect(() => flags.getFlag("nope")).toThrow();
    expect(() => flags.setFlag("nope", true)).toThrow();
    expect(() => flags.toggleFlag("nope")).toThrow();
  });

  it("direct property access works", () => {
    const flags = new LongFlags("foo", "bar");
    (flags as any).foo = true;
    expect(flags.getFlag("foo")).toBe(true);
    (flags as any).bar = false;
    expect(flags.getFlag("bar")).toBe(false);
    expect((flags as any).foo).toBe(true);
    expect((flags as any).bar).toBe(false);
  });

  it("hasFlag works", () => {
    const flags = new LongFlags("f0", "f1");
    expect(flags.hasFlag("f0")).toBe(true);
    expect(flags.hasFlag("f1")).toBe(true);
    expect(flags.hasFlag("f2")).toBe(false);
  });

  it("setFlags and toObject", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    expect(flags.toObject()).toEqual({ f0: true, f1: false });
  });

  it("toggleFlags", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlags({ f0: false, f1: false });
    flags.toggleFlags("f0", "f1");
    expect(flags.getFlag("f0")).toBe(true);
    expect(flags.getFlag("f1")).toBe(true);
  });

  it("count, any, none", () => {
    const flags = new LongFlags("f0", "f1", "f2");
    expect(flags.count()).toBe(0);
    expect(flags.any()).toBe(false);
    expect(flags.none()).toBe(true);
    flags.setFlag("f0", true);
    expect(flags.count()).toBe(1);
    expect(flags.any()).toBe(true);
    expect(flags.none()).toBe(false);
  });

  it("toLong and fromLong", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const longValue = flags.toLong();
    expect(typeof longValue).toBe("number");
    const newFlags = new LongFlags("f0", "f1");
    newFlags.fromLong(longValue);
    expect(newFlags.toObject()).toEqual({ f0: true, f1: false });
  });

  it("throws on invalid fromLong", () => {
    const flags = new LongFlags("f0");
    expect(() => flags.fromLong(-1)).toThrow();
    expect(() => flags.fromLong(4294967296)).toThrow(); // 2^32
    expect(() => flags.fromLong(1.5)).toThrow();
  });

  it("can store more than 16 flags", () => {
    // Create flags with 24 flags (more than ShortFlags' limit but within LongFlags' limit)
    const flags = new LongFlags(
      "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", 
      "f8", "f9", "f10", "f11", "f12", "f13", "f14", "f15", 
      "f16", "f17", "f18", "f19", "f20", "f21", "f22", "f23"
    );
    
    // Set some flags
    flags.setFlags({
      f0: true,
      f15: true,
      f23: true
    });
    
    // Verify they were set correctly
    expect(flags.getFlag("f0")).toBe(true);
    expect(flags.getFlag("f15")).toBe(true);
    expect(flags.getFlag("f23")).toBe(true);
    
    // Verify serialization works with many flags
    const longValue = flags.toLong();
    const newFlags = new LongFlags(
      "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", 
      "f8", "f9", "f10", "f11", "f12", "f13", "f14", "f15", 
      "f16", "f17", "f18", "f19", "f20", "f21", "f22", "f23"
    );
    newFlags.fromLong(longValue);
    
    expect(newFlags.getFlag("f0")).toBe(true);
    expect(newFlags.getFlag("f15")).toBe(true);
    expect(newFlags.getFlag("f23")).toBe(true);
  });

  it("toJSON and fromJSON", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const json = flags.toJSON();
    const restored = LongFlags.fromJSON(json);
    expect(restored.toObject()).toEqual({ f0: true, f1: false });
  });

  it("fromJSON works for both string and object, and throws only for >32 flags or invalid JSON", () => {
    // Accepts string
    const jsonString = JSON.stringify({ foo: true, bar: false });
    const fromString = LongFlags.fromJSON(jsonString);
    expect(fromString.getFlagNames()).toEqual(["foo", "bar"]);
    expect(fromString.toObject()).toEqual({ foo: true, bar: false });

    // Accepts object
    const jsonObj = { f0: true, f1: false };
    const fromObj = LongFlags.fromJSON(jsonObj);
    expect(fromObj.getFlagNames()).toEqual(["f0", "f1"]);
    expect(fromObj.toObject()).toEqual({ f0: true, f1: false });

    // Throws for >32 flags
    const tooMany: Record<string, boolean> = {};
    for (let i = 0; i < 33; i++) {
      tooMany[`f${i}`] = true;
    }
    
    expect(() => LongFlags.fromJSON(tooMany)).toThrow();
    // String case
    expect(() => LongFlags.fromJSON(JSON.stringify(tooMany))).toThrow();

    // Throws for invalid JSON string
    expect(() => LongFlags.fromJSON("not a json")).toThrow();
  });

  it("all, anyOf, noneOf", () => {
    const flags = new LongFlags("f0", "f1", "f2");
    flags.setFlags({ f0: true, f1: false, f2: true });
    expect(flags.all("f0", "f2")).toBe(true);
    expect(flags.all("f0", "f1")).toBe(false);
    expect(flags.anyOf("f1", "f2")).toBe(true);
    expect(flags.anyOf("f1")).toBe(false);
    expect(flags.noneOf("f1")).toBe(true);
    expect(flags.noneOf("f0", "f2")).toBe(false);
  });

  it("iterator and toString", () => {
    const flags = new LongFlags("f0", "f1");
    flags.setFlags({ f0: true, f1: false });
    const entries = Array.from(flags);
    expect(entries).toEqual([
      ["f0", true],
      ["f1", false],
    ]);
    expect(flags.toString()).toContain("LongFlags");
    expect(flags.toString()).toContain("f0=true");
    expect(flags.toString()).toContain("f1=false");
  });

  it("getFlagNames and getFlags return all flag names", () => {
    const flags = new LongFlags("f0", "f1", "f2");
    expect(flags.getFlagNames()).toEqual(["f0", "f1", "f2"]);
    // Deprecated method
    expect(flags.getFlags()).toEqual(["f0", "f1", "f2"]);
  });

  it("createLongFlags returns type-safe instance", () => {
    const flags = createLongFlags("foo", "bar");
    flags.foo = true;
    flags.bar = false;
    expect(flags.foo).toBe(true);
    expect(flags.bar).toBe(false);
  });
});
