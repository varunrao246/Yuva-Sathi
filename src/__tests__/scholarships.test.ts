import { describe, it, expect } from 'vitest';
import { SCHOLARSHIPS_DATA } from '../lib/scholarships-data';

describe('Scholarships Data & Integrity', () => {
  it('contains verified, authentic Indian scholarships with official portals', () => {
    expect(SCHOLARSHIPS_DATA.length).toBeGreaterThanOrEqual(6);

    SCHOLARSHIPS_DATA.forEach(scholarship => {
      expect(scholarship.title).toBeTruthy();
      expect(scholarship.provider).toBeTruthy();
      expect(scholarship.amountText).toMatch(/₹/);
      expect(scholarship.officialUrl).toMatch(/^https:\/\//);
      expect(scholarship.eligibilityCriteria.length).toBeGreaterThan(0);
      expect(scholarship.eligibleCourses.length).toBeGreaterThan(0);
      expect(scholarship.isVerified).toBe(true);
      expect(scholarship.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('supports government vs private filtering', () => {
    const govt = SCHOLARSHIPS_DATA.filter(s => s.type === 'Government');
    const privateGrants = SCHOLARSHIPS_DATA.filter(s => s.type === 'Private');

    expect(govt.length).toBeGreaterThan(0);
    expect(privateGrants.length).toBeGreaterThan(0);
    expect(govt.length + privateGrants.length).toBe(SCHOLARSHIPS_DATA.length);
  });

  it('provides central schemes such as National Scholarship Portal and AICTE', () => {
    const nsp = SCHOLARSHIPS_DATA.find(s => s.id === 'sch_nsp_central_sector');
    expect(nsp).toBeDefined();
    expect(nsp?.officialUrl).toBe('https://scholarships.gov.in');

    const aicte = SCHOLARSHIPS_DATA.find(s => s.id === 'sch_aicte_pragati');
    expect(aicte).toBeDefined();
    expect(aicte?.officialUrl).toBe('https://www.aicte-india.org');
  });
});
