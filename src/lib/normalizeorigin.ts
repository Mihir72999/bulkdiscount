export default function normalizeOrigin(origin: string) {
  return new URL(origin).hostname.toLowerCase();
}