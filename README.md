# City of Vernonia Web GIS

A monorepo containing packages for City of Vernonia web-based geographic information to be a thing.

### [Components](./packages/components)

City of Vernonia web components.

### [Core](./packages/core)

City of Vernonia friends for the ArcGIS Maps SDK for JavaScript.

### [Geospatial Data](./packages/geospatial-data)

City of Vernonia geospatial data.

### [Icons](./packages/icons)

City of Vernonia icons.

### About Packages

All packages for this monorepo are in root `package.json`. The dependencies in `packages/components/package.json` are required for lumina compiler to do proper typings for dev and build. Be sure the versions are the same when updating dependencies.

Running [npm-check-updates](https://github.com/raineorshine/npm-check-updates) is helpful:

```shell
ncu --deep -i
```

`typescript`, `vitest` and `@vitest/browser` packages should tract lumina/calcite-components versions or bad things will happen.

---

Made with :heart: and :coffee: in Vernonia, Oregon
