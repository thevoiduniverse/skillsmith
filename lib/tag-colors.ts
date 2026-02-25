// Tag color system: known tags get fixed hues, custom tags get deterministic hues from a hash.
// All colors share the same saturation/lightness for visual harmony on dark backgrounds.

const TAG_HUE_MAP: Record<string, number> = {
  // Categories
  writing: 45,
  code: 160,
  business: 30,
  education: 270,
  productivity: 190,
  // Common tags
  branding: 40,
  copywriting: 50,
  tone: 55,
  review: 150,
  security: 0,
  "best-practices": 170,
  product: 25,
  requirements: 35,
  planning: 200,
  meetings: 185,
  notes: 210,
  summary: 195,
  email: 60,
  communication: 65,
  bugs: 5,
  qa: 10,
  testing: 155,
  blogging: 48,
  content: 42,
  seo: 75,
  api: 165,
  documentation: 180,
  openapi: 175,
  strategy: 280,
  analysis: 260,
  competitive: 290,
  study: 265,
  learning: 275,
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getHue(tag: string): number {
  const key = tag.toLowerCase();
  if (key in TAG_HUE_MAP) return TAG_HUE_MAP[key];
  return hashString(key) % 360;
}

export function getTagColors(tag: string): { bg: string; text: string } {
  const hue = getHue(tag);
  return {
    bg: `hsla(${hue}, 15%, 50%, 0.10)`,
    text: `hsl(${hue}, 50%, 72%)`,
  };
}
