import { describe, it, expect } from 'vitest';

describe('Basic Test Setup', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to DOM testing utilities', () => {
    const element = document.createElement('div');
    element.textContent = 'Test';
    document.body.appendChild(element);
    
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test');
    
    document.body.removeChild(element);
  });
}); 