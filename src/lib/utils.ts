import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any) {
  if (!date) return 'Just now';
  
  try {
    let d: Date;
    
    // Handle Firestore Timestamp
    if (typeof date.toDate === 'function') {
      d = date.toDate();
    } else {
      d = new Date(date);
    }

    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Just now';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (err) {
    return 'Just now';
  }
}
