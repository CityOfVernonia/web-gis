import { DateTime } from 'luxon';
import { exec } from 'node:child_process';
import fs from 'fs-extra';
import { promisify } from 'node:util';

/**
 * Clean GeoJSON features exported from ArcGIS Pro.
 * @param {string} file GeoJSON file location on disk
 */
export const cleanFeatures = async (file) => {
  try {
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

    console.log(chalk.green(`Cleaned ${file} file.`));
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create MM/DD/YYYY date string from UTC milliseconds.
 * @param {number} milliseconds
 * @returns string
 */
export const dateString = (milliseconds) => {
  return DateTime.fromMillis(milliseconds).toUTC().toLocaleString(DateTime.DATE_SHORT);
};

/**
 * Promisified node:child_process[exec].
 */
export const execute = promisify(exec);
