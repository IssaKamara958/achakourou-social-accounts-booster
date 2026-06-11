/**
 * Ajoute un timeout à une promesse (utile pour les appels fetch sur réseaux lents).
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Le délai d’attente a expiré")), timeoutMs),
  );
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Tente de re-exécuter une fonction asynchrone en cas d'échec.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
