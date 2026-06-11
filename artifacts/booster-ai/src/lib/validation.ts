/**
 * Valide le format d'une adresse email.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Vérifie si les champs d'authentification sont valides avant l'envoi.
 * @returns Un message d'erreur si invalide, sinon null.
 */
export const validateAuthFields = (email: string, password: string): string | null => {
  if (!email.trim()) return "L'adresse email est requise.";
  if (!isValidEmail(email.trim())) return "Le format de l'adresse email n'est pas valide.";
  if (!password) return "Le mot de passe est requis.";
  if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
  return null;
};
