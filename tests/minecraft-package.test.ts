import { describe, expect, it } from "vitest";

import { getMinecraftMimeType, hasSupportedExtension } from "../lib/minecraft-package";

describe("Minecraft package helpers", () => {
  it("accepts the four supported package extensions case-insensitively", () => {
    expect(hasSupportedExtension("texture.MCPACK")).toBe(true);
    expect(hasSupportedExtension("world.mcworld")).toBe(true);
    expect(hasSupportedExtension("behavior.mcaddon")).toBe(true);
    expect(hasSupportedExtension("template.mctemplate")).toBe(true);
  });

  it("rejects unrelated extensions", () => {
    expect(hasSupportedExtension("notes.zip")).toBe(false);
    expect(hasSupportedExtension("pack.mcpack.bak")).toBe(false);
  });

  it("maps supported packages to Minecraft MIME types", () => {
    expect(getMinecraftMimeType({ name: "pack.mcpack" })).toBe("application/x-minecraft-pack");
    expect(getMinecraftMimeType({ name: "world.mcworld" })).toBe("application/x-minecraft-world");
  });
});
