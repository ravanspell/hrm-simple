/**
 * Service to handle encryption and decryption of data.
 * based on crypto library
 */
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  /**
   * Constructs the EncryptionService.
   * @param configService - The configuration service to retrieve encryption key.
   */
  constructor(private configService: ConfigService) {
    // Set up encryption key
    this.key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY'),
      'hex',
    );
  }

  /**
   * Encrypts a given text using AES-256-CBC algorithm.
   * @param text - The plain text to encrypt.
   * @returns The encrypted text in the format "iv:encrypted".
   */
  encrypt(text: string): string {
    // iv (Initialization Vector): A random value added to the encryption process
    // to ensure that identical plaintext inputs produce unique ciphertext outputs.
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Prepend the IV (in hex) to the encrypted text, separated by a colon
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts a given encrypted text using AES-256-CBC algorithm.
   * @param encryptedText - The encrypted text in hex format.
   * @returns The decrypted plain text.
   */
  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
