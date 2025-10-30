import chalk from 'chalk';
import fs from 'fs-extra';

/**
 * Clean GeoJSON feature properties exported from ArcGIS Pro.
 * @use node .\scripts\clean-features.js ./tax-maps/tax-map-boundaries.geojson
 */
(async () => {
  try {
    const file = process.argv[2];

    if (!file) {
      console.log(chalk.red('No file provided.'));

      return;
    }

    const text = await fs.readFile(file, 'utf-8');

    const geojson = JSON.parse(text);

    geojson.features.forEach((feature) => {
      const { properties } = feature;

      delete feature['id'];

      delete properties['OBJECTID'];

      delete properties['Shape_Area'];

      delete properties['Shape_Length'];
    });

    await fs.writeFile(file, JSON.stringify(geojson));

    console.log(chalk.green(`Cleaned ${file}.`));
  } catch (error) {
    console.log(error);
  }
}).call();
