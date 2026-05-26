import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Child</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Child')).toBeDefined();
  });

  it('should render fallback when error occurs', () => {
    const BrokenComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Une erreur est survenue')).toBeDefined();
    expect(screen.getByText('Réessayer')).toBeDefined();
  });

  it('should render custom fallback when provided', () => {
    const BrokenComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Fallback')).toBeDefined();
  });
});
