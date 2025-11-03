import chalk from 'chalk';
import commandExists from 'command-exists';
import download from 'download';
import fs from 'fs-extra';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { dateString, execute } from './utils.js';
import { SPATIAL_EXTENT } from './geometries.js';

const ANNEXATIONS_URL = 'https://gis.columbiacountymaps.com/annex_images/';

const FEATURE_SERVICE_URL =
  'https://gis.columbiacountymaps.com/server/rest/services/Land_Development/Land_Use_Planning/FeatureServer/3';

const FILE_DIRECTORY = 'annexations/pdf/';

const FILE_URL = 'https://geospatial-data.vernonia-or.gov/annexations/pdf/';

const GEOJSON_FILE = 'annexations/annexations.geojson';

/**
 * Download PDF if it does not exist.
 * @param {GeoJSONFeature} feature
 */
const downloadFile = async (feature) => {
  const {
    properties: { boundary_change, image },
  } = feature;

  if (!image) {
    console.log(chalk.red(`${boundary_change} does not have associated files.`));

    return;
  }

  const parts = image.split('.');

  const fileName = parts[0];

  const fileExtension = parts[1];

  const imageFile = `${FILE_DIRECTORY}${image}`;

  const pdfFile = `${FILE_DIRECTORY}${fileName}.pdf`;

  const url = `${ANNEXATIONS_URL}${image}`;

  if (fileExtension.toLowerCase() !== 'tif') {
    console.log(chalk.red(`File extension ${fileExtension} is not supported (${image}).`));

    return;
  }

  try {
    const exists = await fs.exists(pdfFile);

    if (exists) return;

    const imageData = await download(url);

    await fs.writeFile(imageFile, imageData);

    await execute(`tiff2pdf -z -o ${pdfFile} ${imageFile}`);

    await fs.remove(imageFile);

    console.log(chalk.green(`${fileName} successfully downloaded.`));
  } catch (error) {
    if (error.statusCode && error.statusCode === 404) {
      console.log(chalk.red(`Annexation ${image} does not exist at ${`${ANNEXATIONS_URL}${image}`}.`));
    } else {
      console.log(error);
    }
  }
};

/**
 * Normalize features properties.
 * @param {GeoJSONFeature} feature
 */
const normalizeFeatureProperties = (feature) => {
  delete feature['id'];

  const {
    properties: { BNDY_CHG_1, InitialDat, DORApprove, DORApprova, DORAppro_1, DateComple, IMAGE, GIS_IMAGE },
  } = feature;

  const _properties = {
    boundary_change: BNDY_CHG_1 && BNDY_CHG_1 !== ' ' ? BNDY_CHG_1 : GIS_IMAGE,
    initial_date: InitialDat ? dateString(InitialDat) : 'Unknown',
    completed_date: DateComple ? dateString(DateComple) : 'Unknown',
    dor_approved: DORApprove === 'Y' ? 'Yes' : 'No, n/a, or unknown',
    dor_id: DORApprova || 'Unknown',
    dor_date: DORAppro_1 ? dateString(DORAppro_1) : 'Unknown',
    image: IMAGE ? IMAGE : null,
    pdf_url: IMAGE ? `${FILE_URL}${IMAGE.replace('tif', 'pdf')}` : null,
  };

  feature.properties = _properties;
};

(async () => {
  await commandExists('tiff2pdf');

  console.log(chalk.green('Running city annexations...'));

  try {
    const geojson = await queryFeatures({
      f: 'geojson',
      geometry: SPATIAL_EXTENT,
      geometryType: 'esriGeometryPolygon',
      httpMethod: 'POST',
      orderByFields: ['OBJECTID ASC'],
      outFields: [
        'BNDY_CHG_1',
        'InitialDat',
        'DORApprove',
        'DORApprova',
        'DORAppro_1',
        'DateComple',
        'IMAGE',
        'GIS_IMAGE',
      ],
      outSR: '4326',
      returnGeometry: true,
      spatialRel: 'esriSpatialRelIntersects',
      url: FEATURE_SERVICE_URL,
    });

    geojson.features.forEach(normalizeFeatureProperties);

    await fs.writeFile(GEOJSON_FILE, JSON.stringify(geojson));

    geojson.features.forEach(downloadFile);
  } catch (error) {
    if (error === null) {
      console.log(chalk.red(`tiff2pdf must be installed and available via the command line.`));
    } else {
      console.log(error);
    }
  }
}).call();
