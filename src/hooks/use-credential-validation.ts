import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { checkUsername, validatePassword } from "@/lib/api";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const VALIDATION_DELAY_MS = 400;

export interface ValidationState {
  isChecking: boolean;
  isValid: boolean | null;
  errors: string[];
}

export function useUsernameValidation(value: string, currentUsername?: string): ValidationState {
  const username = value.trim();
  const debouncedUsername = useDebouncedValue(username, VALIDATION_DELAY_MS);
  const isCurrentUsername = Boolean(currentUsername) && username.toLowerCase() === currentUsername?.toLowerCase();
  const formatError = username.length >= 3 && !USERNAME_PATTERN.test(username)
    ? "Потребителското име може да съдържа само латински букви, цифри и долна черта."
    : null;
  const canCheck = username.length >= 3 && !formatError && !isCurrentUsername;

  const query = useQuery({
    queryKey: ["username-availability", debouncedUsername.toLowerCase()],
    queryFn: () => checkUsername(debouncedUsername),
    enabled: canCheck && debouncedUsername === username,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (username.length < 3) return { isChecking: false, isValid: null, errors: [] };
  if (formatError) return { isChecking: false, isValid: false, errors: [formatError] };
  if (isCurrentUsername) return { isChecking: false, isValid: true, errors: [] };
  if (debouncedUsername !== username || query.isFetching) return { isChecking: true, isValid: null, errors: [] };
  if (query.error) {
    return {
      isChecking: false,
      isValid: false,
      errors: [query.error instanceof Error ? query.error.message : "Грешка при проверката на името."],
    };
  }

  const isAvailable = query.data?.is_available;
  return {
    isChecking: false,
    isValid: typeof isAvailable === "boolean" ? isAvailable : null,
    errors: isAvailable === false ? ["Потребителското име е заето."] : [],
  };
}

export function usePasswordValidation(value: string): ValidationState {
  const password = value;
  const debouncedPassword = useDebouncedValue(password, VALIDATION_DELAY_MS);

  const query = useQuery({
    queryKey: ["password-validation", debouncedPassword],
    queryFn: () => validatePassword(debouncedPassword),
    enabled: Boolean(password.trim()) && debouncedPassword === password,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!password.trim()) return { isChecking: false, isValid: null, errors: [] };
  if (debouncedPassword !== password || query.isFetching) return { isChecking: true, isValid: null, errors: [] };
  if (query.error) {
    return {
      isChecking: false,
      isValid: false,
      errors: [query.error instanceof Error ? query.error.message : "Грешка при валидация на паролата."],
    };
  }

  const isValid = query.data?.is_valid;
  return {
    isChecking: false,
    isValid: typeof isValid === "boolean" ? isValid : null,
    errors: isValid === false ? query.data?.errors ?? [] : [],
  };
}

export function getPasswordsMatch(password: string, confirmation: string): boolean | null {
  if (!confirmation) return null;
  return Boolean(password) && password === confirmation;
}
