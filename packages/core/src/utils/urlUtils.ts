/**
 * Return a URL for a tax map's PDF on the city's website.
 * @param taxMap tax map id, e.g. `4403BD`
 * @returns A URL to the tax map's PDF.
 */
export const cityTaxMapURL = (taxMap: string): string => {
  return `https://geospatial-data.vernonia-or.gov/tax-maps/pdf/${taxMap}.pdf`;
};

/**
 * Return a URL for a tax map's PDF on the county's website.
 * @param taxMap tax map id, e.g. `4403BD`
 * @returns A URL to the tax map's PDF.
 */
export const countyTaxMapURL = (taxMap: string): string => {
  return `https://gis.columbiacountymaps.com/TaxMaps/${taxMap}.pdf`;
};

/**
 * Return a URLs for a tax map's JPEG and georeference XML.
 * @param taxMap tax map id, e.g. `4403BD`
 * @returns An Object with URLs to the tax map's JPEG and georeference XML.
 */
export const georeferencedTaxMapURLs = (taxMap: string): { imageUrl: string; georeferenceUrl: string } => {
  const imageUrl = `https://geospatial-data.vernonia-or.gov/tax-maps/jpg/${taxMap}.jpg`;

  return {
    imageUrl,
    georeferenceUrl: `${imageUrl}.aux.xml`,
  };
};
