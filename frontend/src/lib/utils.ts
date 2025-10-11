import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-GT').format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-success-DEFAULT';
  if (value < 0) return 'text-danger-DEFAULT';
  return 'text-gray-400';
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-success-DEFAULT/10 text-success-DEFAULT';
  if (value < 0) return 'bg-danger-DEFAULT/10 text-danger-DEFAULT';
  return 'bg-gray-500/10 text-gray-400';
}