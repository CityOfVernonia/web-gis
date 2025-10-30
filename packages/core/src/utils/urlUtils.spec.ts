import { describe, expect, it } from 'vitest';
import { cityTaxMapURL, countyTaxMapURL, georeferencedTaxMapURLs } from './urlUtils';

const TAX_MAP = '4405AA';

describe('urlUtils', () => {
  describe('city tax map url', () => {
    it('should return the proper url', () => {
      expect(cityTaxMapURL(TAX_MAP)).toBe(`https://geospatial-data.vernonia-or.gov/tax-maps/pdf/${TAX_MAP}.pdf`);
    });
  });

  describe('county tax map url', () => {
    it('should return the proper url', () => {
      expect(countyTaxMapURL(TAX_MAP)).toBe(`https://gis.columbiacountymaps.com/TaxMaps/${TAX_MAP}.pdf`);
    });
  });

  describe('georeferenced tax map urls', () => {
    it('should return the proper url', () => {
      expect(georeferencedTaxMapURLs(TAX_MAP)).toEqual({
        imageUrl: `https://geospatial-data.vernonia-or.gov/tax-maps/jpg/${TAX_MAP}.jpg`,
        georeferenceUrl: `https://geospatial-data.vernonia-or.gov/tax-maps/jpg/${TAX_MAP}.jpg.aux.xml`,
      });
    });
  });
});
