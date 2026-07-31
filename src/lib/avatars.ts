const modules = import.meta.glob("@/assets/icons/agent/*.svg", {
  eager: true,
}) as Record<string, { default: string }>;

export const avatarUrls: Record<string, string> = {};
for (const [path, mod] of Object.entries(modules)) {
  const key = path.split("/").pop()!.replace(".svg", "");
  avatarUrls[key] = mod.default;
}

export const avatarKeys = Object.keys(avatarUrls).sort();
