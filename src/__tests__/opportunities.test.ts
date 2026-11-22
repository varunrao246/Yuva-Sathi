import { describe, it, expect } from 'vitest';
import { OPPORTUNITIES_DATA } from '../lib/opportunities-data';

describe('Student Opportunities & Gigs Integrity', () => {
  it('contains diverse student work categories with verified INR compensation', () => {
    expect(OPPORTUNITIES_DATA.length).toBeGreaterThanOrEqual(6);

    OPPORTUNITIES_DATA.forEach(opp => {
      expect(opp.title).toBeTruthy();
      expect(opp.organization).toBeTruthy();
      expect(opp.compensation).toMatch(/₹/);
      expect(opp.compensationVerified).toBe(true);
      expect(opp.requiredSkills.length).toBeGreaterThan(0);
      expect(opp.applyUrl).toMatch(/^https:\/\//);
      expect(opp.isVerified).toBe(true);
    });
  });

  it('includes multiple opportunity types (Campus Roles, Remote Work, Internships, Freelance)', () => {
    const types = new Set(OPPORTUNITIES_DATA.map(o => o.type));
    expect(types.has('Campus Role')).toBe(true);
    expect(types.has('Remote Work')).toBe(true);
    expect(types.has('Internship')).toBe(true);
    expect(types.has('Freelance Gig')).toBe(true);
  });

  it('provides student-friendly hours specifications', () => {
    const flexibleRoles = OPPORTUNITIES_DATA.filter(o => o.workingHours);
    expect(flexibleRoles.length).toBeGreaterThan(0);
  });
});
