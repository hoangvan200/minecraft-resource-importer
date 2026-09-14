export const supportedExtensions = [".mcpack", ".mcaddon", ".mcworld", ".mctemplate"] as const;

export type MinecraftPackage = {
  name: string;
  mimeType?: string;
};

export function hasSupportedExtension(name: string) {
  const lowerName = name.toLowerCase();
  return supportedExtensions.some((extension) => lowerName.endsWith(extension));
}

export function getMinecraftMimeType(file: MinecraftPackage) {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".mcpack")) return "application/x-minecraft-pack";
  if (lowerName.endsWith(".mcaddon")) return "application/x-minecraft-addon";
  if (lowerName.endsWith(".mcworld")) return "application/x-minecraft-world";
  if (lowerName.endsWith(".mctemplate")) return "application/x-minecraft-template";
  return file.mimeType || "application/octet-stream";
}
