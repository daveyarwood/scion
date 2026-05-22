/**
 * Date formatting utilities for the client.
 */

/**
 * Format a date string to a readable date format.
 * Uses locale-aware formatting (en-US by default).
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toLowerCase();
};
