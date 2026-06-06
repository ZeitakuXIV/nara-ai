/**
 * NARA AI Cryptography Utility (UU PDP Compliance)
 * Implements client-side AES-GCM 256-bit encryption for biometrics.
 * Uses browser-native Web Crypto API to avoid external bundle bloat.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper to derive a 256-bit CryptoKey from a secret passcode string
async function getEncryptionKey(secret: string): Promise<CryptoKey | null> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }
  const keyData = encoder.encode(secret);
  const hash = await window.crypto.subtle.digest('SHA-256', keyData);
  return window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to Hex String
function bufToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to ArrayBuffer
function hexToBuf(hexString: string): ArrayBuffer {
  const matches = hexString.match(/[\da-f]{2}/gi);
  const bytes = new Uint8Array(matches ? matches.map((h) => parseInt(h, 16)) : []);
  return bytes.buffer;
}

/**
 * Encrypts plaintext string using AES-GCM 256.
 * Returns formatted ciphertext string "hexIV:hexCiphertext".
 */
export async function encryptData(plaintext: string, secret: string = "NARA_AI_SECRET_KEY"): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return plaintext;
  }
  try {
    const key = await getEncryptionKey(secret);
    if (!key) return plaintext;

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    const hexIv = bufToHex(iv.buffer);
    const hexEncrypted = bufToHex(encrypted);
    return `${hexIv}:${hexEncrypted}`;
  } catch (err) {
    console.error("🔒 NARA Crypto: Encryption failed:", err);
    return plaintext;
  }
}

/**
 * Decrypts formatted ciphertext string "hexIV:hexCiphertext" using AES-GCM 256.
 */
export async function decryptData(ciphertext: string, secret: string = "NARA_AI_SECRET_KEY"): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return ciphertext;
  }
  if (!ciphertext || !ciphertext.includes(':')) {
    return ciphertext; // Return as-is if not in expected encrypted format
  }
  try {
    const [hexIv, hexEncrypted] = ciphertext.split(':');
    const key = await getEncryptionKey(secret);
    if (!key) return ciphertext;

    const iv = new Uint8Array(hexToBuf(hexIv));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      hexToBuf(hexEncrypted)
    );

    return decoder.decode(decrypted);
  } catch (err) {
    console.error("🔒 NARA Crypto: Decryption failed (bad key or corrupted data):", err);
    return ciphertext;
  }
}
