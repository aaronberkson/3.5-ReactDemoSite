// emailUtility.js
// Prevents casual scrapers from immediately reading the email address.
export const obfuscatedEmail = [
  104, 101, 108, 108, 111, 64, 97, 97, 114, 111, 110, 98, 101, 114, 107, 115, 111, 110, 46, 105, 111
];

// Function to reconstruct the email.
export function getDecryptedEmail() {
  return String.fromCharCode(...obfuscatedEmail);
}
