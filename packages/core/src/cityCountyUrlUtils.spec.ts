import { describe, expect, it } from 'vitest';
import { cityTaxMapURL, countyAssessorURL, countyTaxMapURL, georeferencedTaxMapURLs } from './cityCountyUrlUtils';

const TAX_MAP = '4405AA';

const ACCOUNT_ID = '22995';

describe('urlUtils', () => {
  describe('city tax map url', () => {
    it('should return the proper url', () => {
      expect(cityTaxMapURL(TAX_MAP)).toBe(`https://geospatial-data.vernonia-or.gov/tax-maps/pdf/${TAX_MAP}.pdf`);
    });
  });

  describe('county assessor property information url', () => {
    it('should return the proper url', () => {
      expect(countyAssessorURL(ACCOUNT_ID)).toBe(
        `https://propertysearch.columbiacountyor.gov/PSO/detail/${ACCOUNT_ID}/R`,
      );
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
