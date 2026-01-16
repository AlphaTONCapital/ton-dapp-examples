import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function throwIfUndefined<T>(
  value: T | undefined,
  name: string
): asserts value is T {
  if (value === undefined) {
    throw new Error(`${name} env is not defined`);
  }
}
