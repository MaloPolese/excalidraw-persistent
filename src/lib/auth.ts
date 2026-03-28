const SECRET = process.env.SECRET ?? "changeme-secret";
const PASSWORD = process.env.BOARD_PASSWORD ?? "";

const TOKEN_VALUE = "authenticated";

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string): Promise<string> {
  const key = await getKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${value}.${hex}`;
}

async function unsign(signed: string): Promise<string | false> {
  const index = signed.lastIndexOf(".");
  if (index === -1) return false;
  const value = signed.slice(0, index);
  const expected = await sign(value);
  if (expected.length !== signed.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signed.charCodeAt(i);
  }
  return diff === 0 ? value : false;
}

export async function createToken(): Promise<string> {
  return sign(TOKEN_VALUE);
}

export async function verifyToken(token: string): Promise<boolean> {
  const value = await unsign(token);
  return value === TOKEN_VALUE;
}

export async function checkPassword(password: string): Promise<boolean> {
  if (!PASSWORD) return false;
  const enc = new TextEncoder();
  const a = enc.encode(password);
  const b = enc.encode(PASSWORD);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
