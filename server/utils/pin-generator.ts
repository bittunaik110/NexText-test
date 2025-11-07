export function generatePIN(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pin = '';
  
  for (let i = 0; i < 6; i++) {
    pin += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return pin;
}

export async function generateUniquePIN(checkExists: (pin: string) => Promise<boolean>): Promise<string> {
  let pin = generatePIN();
  let attempts = 0;
  const maxAttempts = 10;

  while (await checkExists(pin) && attempts < maxAttempts) {
    pin = generatePIN();
    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error('Failed to generate unique PIN');
  }

  return pin;
}
