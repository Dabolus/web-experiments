import { setupWorkerServer } from './utils';

export type EncryptionAlgorithm = 'AES-CTR' | 'AES-CBC' | 'AES-GCM';

export interface PreprocessorWorker extends Worker {
  encrypt(
    message: string | Uint8Array,
    password: string | Uint8Array,
    algorithm: EncryptionAlgorithm,
  ): Promise<Uint8Array>;
  decrypt(
    message: string | Uint8Array,
    password: string | Uint8Array,
    algorithm: EncryptionAlgorithm,
  ): Promise<Uint8Array>;
}

const encoder = new TextEncoder();

const getKeyFromPassword = async (
  password: Uint8Array,
  algorithm: EncryptionAlgorithm,
): Promise<CryptoKey> => {
  // Import the password as a key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    password,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  // Derive the encryption key from the password
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(0),
      hash: 'SHA-512',
      iterations: 210000, // As recommended by OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
    },
    passwordKey,
    { name: algorithm, length: 128 },
    true,
    ['encrypt', 'decrypt'],
  );

  return encryptionKey;
};

export const encrypt: PreprocessorWorker['encrypt'] = async (
  message,
  password,
  algorithm,
) => {
  const encodedMessage =
    typeof message === 'string' ? encoder.encode(message) : message;
  const encodedPassword =
    typeof password === 'string' ? encoder.encode(password) : password;

  // Get the encryption key from the password
  const encryptionKey = await getKeyFromPassword(encodedPassword, algorithm);
  // Generate the IV/counter
  const ivOrCounter = crypto.getRandomValues(new Uint8Array(16));
  // Run the encryption algorithm with the key and data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: algorithm,
      length: 128,
      [algorithm === 'AES-CTR' ? 'counter' : 'iv']: ivOrCounter,
    },
    encryptionKey,
    encodedMessage,
  );

  const finalData = new Uint8Array(
    ivOrCounter.byteLength + encrypted.byteLength,
  );
  finalData.set(new Uint8Array(ivOrCounter));
  finalData.set(new Uint8Array(encrypted), ivOrCounter.byteLength);

  return finalData;
};

export const decrypt: PreprocessorWorker['decrypt'] = async (
  message,
  password,
  algorithm,
) => {
  const encodedMessage =
    typeof message === 'string' ? encoder.encode(message) : message;
  const encodedPassword =
    typeof password === 'string' ? encoder.encode(password) : password;

  // Split the IV/counter from the encrypted data
  const ivOrCounter = encodedMessage.slice(0, 16);
  const encrypted = encodedMessage.slice(16);
  // Get the decryption key from the password
  const decryptionKey = await getKeyFromPassword(encodedPassword, algorithm);
  // Run the decryption algorithm with the key and cyphertext
  const decrypted = await crypto.subtle.decrypt(
    {
      name: algorithm,
      length: 128,
      [algorithm === 'AES-CTR' ? 'counter' : 'iv']: ivOrCounter,
    },
    decryptionKey,
    encrypted,
  );

  return new Uint8Array(decrypted);
};

setupWorkerServer<PreprocessorWorker>({
  encrypt,
  decrypt,
});
