import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'PPP'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Format time as HH:mm
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

/**
 * Get week number from date
 */
export function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
}

/**
 * Get year-week format (e.g., 202501 for week 1 of 2025)
 */
export function getYearWeek(date: Date = new Date()): number {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return parseInt(`${year}${String(week).padStart(2, '0')}`);
}

/**
 * Calculate total volume (weight * reps * sets)
 */
export function calculateTotalVolume(
  weight: number,
  reps: number,
  sets: number
): number {
  return weight * reps * sets;
}

/**
 * Calculate average RPE from array
 */
export function calculateAverageRPE(rpeArray: number[]): number {
  if (rpeArray.length === 0) return 0;
  const sum = rpeArray.reduce((a, b) => a + b, 0);
  return Math.round((sum / rpeArray.length) * 10) / 10;
}

/**
 * Calculate achievement rate (completion/total * 100)
 */
export function calculateRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100 * 10) / 10;
}

/**
 * Format byte size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(arr: T[]): boolean {
  return !arr || arr.length === 0;
}

/**
 * Get unique items from array
 */
export function getUnique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Convert array to object with key-value pairs
 */
export function arrayToObject<T extends Record<string, unknown>>(
  arr: T[],
  keyField: keyof T
): Record<string, T> {
  return arr.reduce(
    (acc, item) => {
      acc[String(item[keyField])] = item;
      return acc;
    },
    {} as Record<string, T>
  );
}
