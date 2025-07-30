import { describe, it, expect } from 'vitest';

describe('Date Utilities', () => {
  describe('date grouping logic', () => {
    it('should identify today correctly', () => {
      const isToday = (date: string) => {
        const today = new Date();
        const dateToCheck = new Date(date);
        return dateToCheck.toDateString() === today.toDateString();
      };

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      expect(isToday(today)).toBe(true);
      expect(isToday(tomorrow)).toBe(false);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should identify tomorrow correctly', () => {
      const isTomorrow = (date: string) => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const dateToCheck = new Date(date);
        return dateToCheck.toDateString() === tomorrow.toDateString();
      };

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      expect(isTomorrow(tomorrow)).toBe(true);
      expect(isTomorrow(today)).toBe(false);
      expect(isTomorrow(dayAfterTomorrow)).toBe(false);
    });

    it('should identify overdue tasks correctly', () => {
      const isOverdue = (date: string) => {
        const today = new Date();
        const dueDate = new Date(date);
        return dueDate < today && dueDate.toDateString() !== today.toDateString();
      };

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      expect(isOverdue(yesterday)).toBe(true);
      expect(isOverdue(today)).toBe(false);
      expect(isOverdue(tomorrow)).toBe(false);
    });

    it('should format dates correctly', () => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      // Test that the function formats dates in the expected format
      const testDate = '2024-01-15';
      const formatted = formatDate(testDate);
      
      // Should contain the expected format components
      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
      expect(formatted).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4}$/);
      
      // Should be a valid date format
      expect(formatted).toMatch(/^[A-Za-z]+, January \d{1,2}, 2024$/);
    });

    it('should handle invalid dates', () => {
      const isValidDate = (dateString: string) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should compare dates correctly', () => {
      const compareDates = (date1: string, date2: string) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getTime() - d2.getTime();
      };

      expect(compareDates('2024-01-15', '2024-01-15')).toBe(0);
      expect(compareDates('2024-01-15', '2024-01-16')).toBeLessThan(0);
      expect(compareDates('2024-01-16', '2024-01-15')).toBeGreaterThan(0);
    });
  });

  describe('date sorting', () => {
    it('should sort dates in ascending order', () => {
      const dates = [
        '2024-01-20',
        '2024-01-15',
        '2024-01-25',
        '2024-01-10',
      ];

      const sortedDates = dates.sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      expect(sortedDates).toEqual([
        '2024-01-10',
        '2024-01-15',
        '2024-01-20',
        '2024-01-25',
      ]);
    });

    it('should handle empty date arrays', () => {
      const dates: string[] = [];
      const sortedDates = dates.sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      expect(sortedDates).toEqual([]);
    });
  });

  describe('relative date formatting', () => {
    it('should format relative dates correctly', () => {
      const getRelativeDate = (dateString: string) => {
        const today = new Date();
        const date = new Date(dateString);
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays < 0) return 'Overdue';
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      expect(getRelativeDate(today)).toBe('Today');
      expect(getRelativeDate(tomorrow)).toBe('Tomorrow');
      expect(getRelativeDate(yesterday)).toBe('Yesterday');
      
      // For future dates, it should return a formatted date string
      const futureFormatted = getRelativeDate(futureDate);
      expect(futureFormatted).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4}$/);
    });
  });
}); 