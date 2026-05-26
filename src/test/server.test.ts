import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email address is required'),
});

const readmeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sectionsToInclude: z.array(z.string()).min(1).max(50),
});

describe('Validation Schemas', () => {
  it('should accept valid login email', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid login email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject empty login email', () => {
    const result = loginSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('should accept valid readme request', () => {
    const result = readmeSchema.safeParse({
      name: 'My Project',
      description: 'A test project',
      sectionsToInclude: ['intro', 'features'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject readme request with empty name', () => {
    const result = readmeSchema.safeParse({
      name: '',
      description: 'A test project',
      sectionsToInclude: ['intro'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject readme request with empty sections', () => {
    const result = readmeSchema.safeParse({
      name: 'My Project',
      description: 'A test project',
      sectionsToInclude: [],
    });
    expect(result.success).toBe(false);
  });
});
