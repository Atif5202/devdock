import { describe, it, expect } from 'vitest';
import { defaultReadmeSections, defaultBadges, defaultPalette, defaultComponentLibrary, defaultProjectArchitectures, defaultDocs } from '../data/defaults';

describe('Default Data', () => {
  it('should have valid readme sections', () => {
    expect(defaultReadmeSections.length).toBeGreaterThan(0);
    defaultReadmeSections.forEach((section) => {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBeTruthy();
      expect(typeof section.enabled).toBe('boolean');
    });
  });

  it('should have valid badges', () => {
    expect(defaultBadges.length).toBeGreaterThan(0);
    defaultBadges.forEach((badge) => {
      expect(badge.id).toBeTruthy();
      expect(badge.label).toBeTruthy();
      expect(badge.color).toMatch(/^[0-9a-f]{6}$/i);
    });
  });

  it('should have valid palette', () => {
    expect(defaultPalette.id).toBeTruthy();
    expect(defaultPalette.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(defaultPalette.secondary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(defaultPalette.background).toMatch(/^#[0-9a-f]{6}$/i);
    expect(defaultPalette.text).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should have valid component library', () => {
    expect(defaultComponentLibrary.length).toBeGreaterThan(0);
    defaultComponentLibrary.forEach((comp) => {
      expect(comp.id).toBeTruthy();
      expect(comp.code).toContain('import');
    });
  });

  it('should have valid architectures', () => {
    expect(defaultProjectArchitectures.length).toBeGreaterThan(0);
    defaultProjectArchitectures.forEach((arch) => {
      expect(arch.name).toBeTruthy();
      expect(arch.root.type).toBe('directory');
    });
  });

  it('should have valid doc pages', () => {
    expect(defaultDocs.length).toBeGreaterThan(0);
    defaultDocs.forEach((doc) => {
      expect(doc.id).toBeTruthy();
      expect(doc.title).toBeTruthy();
      expect(doc.content).toBeTruthy();
    });
  });
});
