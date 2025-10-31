import chalk from 'chalk';
import commandExists from 'command-exists';
import download from 'download';
import fs from 'fs-extra';
import imgToPDF from 'image-to-pdf';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { execute, dateString } from './utils.js';
import { SPATIAL_EXTENT } from './geometries.js';

const FEATURE_SERVICE_URL =
  'https://gis.columbiacountymaps.com/server/rest/services/BaseData/Survey_Research/FeatureServer/0';

const FILE_DIRECTORY = 'surveys/pdf/';

const FILE_URL = 'https://geospatial-data.vernonia-or.gov/surveys/pdf/';

const GEOJSON_FILE = 'surveys/surveys.geojson';

const SURVEY_URL = 'https://gis.columbiacountymaps.com/Surveys/';

/**
 * Normalize features properties.
 * @param {GeoJSONFeature} feature
 */
const normalizeFeatureProperties = (feature) => {
  const { properties } = feature;

  // remove non-useful string values
  for (const property in properties) {
    if (properties.hasOwnProperty(property) && properties[property] === ' ') properties[property] = null;

    if (properties.hasOwnProperty(property) && properties[property] === '') properties[property] = null;

    if (properties.hasOwnProperty(property) && properties[property] === 'None Given') properties[property] = null;
  }

  // create friendlier properties and set values
  Object.defineProperty(properties, 'Sheets', Object.getOwnPropertyDescriptor(properties, 'NumberofSh'));
  delete properties['NumberofSh'];

  Object.defineProperty(properties, 'Subdivision', Object.getOwnPropertyDescriptor(properties, 'Subdivisio'));
  delete properties['Subdivisio'];

  Object.defineProperty(properties, 'SurveyId', Object.getOwnPropertyDescriptor(properties, 'SURVEYID'));
  delete properties['SURVEYID'];

  properties.SVY_IMAGE = `${FILE_URL}${properties.SVY_IMAGE.replace('.TIF', '.pdf')
    .replace('.tif', '.pdf')
    .replace('.jpg', '.pdf')
    .replace(' ', '%20')}`;
  Object.defineProperty(properties, 'SurveyUrl', Object.getOwnPropertyDescriptor(properties, 'SVY_IMAGE'));
  delete properties['SVY_IMAGE'];

  // standardize null properties
  if (!properties.Client) properties.Client = 'Unknown';

  if (!properties.Comments) properties.Comments = 'None';

  if (!properties.Firm) properties.Firm = 'Unknown';

  if (!properties.Sheets) properties.Sheets = 0;

  // survey types
  switch (properties.SurveyType) {
    case 'BPA':
    case '1':
      properties.SurveyType = 'BPA';
      break;
    case 'BT RECORD':
    case '2':
      properties.SurveyType = 'BT Record';
      break;
    case 'CONDOMINIUM':
    case '3':
      properties.SurveyType = 'Condominium';
      break;
    case 'CORNER RESTORATION':
    case '4':
      properties.SurveyType = 'Corner Restoration';
      break;
    case 'DATA SHEETS':
    case '5':
      properties.SurveyType = 'Data Sheets';
      break;
    case 'FIELD BOOKS':
    case '6':
      properties.SurveyType = 'Field Books';
      break;
    case 'PARTITION':
    case '7':
      properties.SurveyType = 'Partition';
      break;
    case 'SUBDIVISION':
    case '8':
      properties.SurveyType = 'Subdivision';
      break;
    case 'Survey':
    case '9':
      properties.SurveyType = 'Survey';
      break;
    default:
      properties.SurveyType = 'Unknown';
  }

  // ensure Subdivision is null if not a subdivision
  if (properties.SurveyType !== 'Subdivision') properties.Subdivision = null;

  // timestamp for sorting (unknown = 1/1/1850 12:00 am UTC)
  properties.Timestamp = properties.SurveyDate ? properties.SurveyDate : -3786825600000;

  // date fields to MM/DD/YYYY strings
  if (properties.FileDate) {
    properties.FileDate = dateString(properties.FileDate);
  } else {
    properties.FileDate = 'Unknown';
  }

  if (properties.SurveyDate) {
    properties.SurveyDate = dateString(properties.SurveyDate);
  } else {
    properties.SurveyDate = 'Unknown';
  }
};

/**
 * Download and convert image to PDF if it does not exist.
 * @param {string} image
 */
const processRecordSurvey = async (image) => {
  const parts = image.split('.');

  const fileName = parts[0];

  const fileExtension = parts[1];

  const imageFile = `${FILE_DIRECTORY}${image}`;

  const pdfFile = `${FILE_DIRECTORY}${fileName}.pdf`;

  const url = `${SURVEY_URL}${image}`;

  if (fileExtension.toLowerCase() !== 'tif' && fileExtension.toLowerCase() !== 'jpg') {
    console.log(chalk.red(`File extension ${fileExtension} is not supported (${image}).`));

    return;
  }

  try {
    const exists = await fs.exists(pdfFile);

    if (exists) return;

    const imageData = await download(url);

    await fs.writeFile(imageFile, imageData);

    if (fileExtension.toLowerCase() === 'tif') {
      await execute(`tiff2pdf -z -o ${pdfFile} ${imageFile}`);

      await fs.remove(imageFile);
    }

    if (fileExtension.toLowerCase() === 'jpg') {
      const stream = fs.createWriteStream(pdfFile);

      stream.on('finish', async () => {
        await fs.remove(imageFile);
      });

      await imgToPDF([imageFile]).pipe(stream);

      chalk.yellow(`${image} is a jpeg file. Validate proper PDF conversion (image -> pdf dimensions). ${url}`);
    }

    console.log(chalk.green(`Survey ${fileName} successfully created.`));
  } catch (error) {
    if (error.statusCode && error.statusCode === 404) {
      console.log(chalk.red(`Survey image ${image} does not exist at ${url}.`));
    } else {
      console.log(error);
    }
  }
};

/**
 * Check for tiff2pdf and run.
 */
(async () => {
  try {
    await commandExists('tiff2pdf');

    console.log(chalk.green('Running surveys...'));

    const images = [];

    const geojson = await queryFeatures({
      f: 'geojson',
      geometry: SPATIAL_EXTENT,
      geometryType: 'esriGeometryPolygon',
      orderByFields: ['OBJECTID ASC'],
      outFields: [
        'Client',
        'Comments',
        'FileDate',
        'Firm',
        'NumberofSh',
        'SURVEYID',
        'SVY_IMAGE',
        'SurveyDate',
        'SurveyType',
        'Subdivisio',
      ],
      url: FEATURE_SERVICE_URL,
      returnGeometry: true,
      spatialRel: 'esriSpatialRelIntersects',
    });

    console.log(chalk.green(`${geojson.features.length} surveys returned.`));

    geojson.features.forEach((feature) => {
      images.push(feature.properties.SVY_IMAGE);

      normalizeFeatureProperties(feature);
    });

    await fs.writeFile(GEOJSON_FILE, JSON.stringify(geojson));

    images.forEach(processRecordSurvey);
  } catch (error) {
    if (error === null) {
      console.log(chalk.red(`tiff2pdf must be installed and available via the command line.`));
    } else {
      console.log(error);
    }
  }
}).call();
