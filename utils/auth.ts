import * as Crypto from 'expo-crypto';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  const saltedPassword = password + SALT_ROUNDS.toString();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    saltedPassword
  );
  return hash;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export { hashPassword, verifyPassword };
