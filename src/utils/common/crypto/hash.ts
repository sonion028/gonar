export type SupportedHashType = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * @author sonion
 * @description 字符串转哈希
 * @param {string} message - 要转换的字符串
 * @param {SupportedHashType} algorithm - 哈希算法，默认SHA-1
 */
export async function stringToHash(
  message: string,
  algorithm: SupportedHashType = 'SHA-1'
): Promise<string> {
  try {
    if (!message) {
      throw new Error('message is empty');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await globalThis.crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    throw err instanceof Error ? err : new Error('string to hash failed');
  }
}
