---
title: Surveys
description: Columbia County surveys, plats and other recorded survey documents within the Vernonia spatial extent.
permalink: /surveys/
preview: surveys.json
---

### Surveys

**GeoJSON:** [surveys.geojson](surveys.geojson)

**GeoJSONLayer JSON:** [surveys.json](surveys.json)

**Updated:** 2025.10.31

**Copyright:** Columbia County, Oregon and City of Vernonia, Oregon

**Properties/Attributes:**

```json
"properties": {
  "Client": "Weyerhaeuser NR Company",
  "Comments": "Two unsurveyed 80 acre parcels",
  "FileDate": "3/28/2016",
  "Firm": "KLS SURVEYING INC",
  "SurveyDate": "2/8/2016",
  "SurveyType": "Partition",
  "Sheets": 2,
  "Subdivision": null,
  "SurveyId": "PP2016-04",
  "SurveyUrl": "https://geospatial-data.vernonia-or.gov/surveys/pdf/PP2016-04.pdf",
  "Timestamp": 1454889600000
}
```

### Update

**Requirements**

[libtiff](http://www.libtiff.org/) installed and `tiff2pdf` available via the command line.

**Run**

```shell
npm run record-surveys
```
