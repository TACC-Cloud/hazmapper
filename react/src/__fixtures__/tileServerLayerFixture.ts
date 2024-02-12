export const tileServerLayers = [
  {
    id: 134,
    name: 'Roads',
    type: 'tms',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: 0,
      opacity: 0.9,
      isActive: true,
      showInput: false,
      showDescription: true,
    },
  },
  {
    id: 133,
    name: 'Satellite',
    type: 'tms',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: 1,
      opacity: 0.5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
  {
    id: 517,
    name: 'PineRidge_20190330',
    type: 'arcgis',
    url: 'https://tiles.arcgis.com/tiles/JL4BwWcjcPuWhBm9/arcgis/rest/services/PineRidgeSchool_20190330/MapServer',
    attribution: '',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: -2,
      opacity: 0.5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
  {
    id: 521,
    name: 'PonderosaElementary_20190328',
    type: 'arcgis',
    url: 'https://tiles.arcgis.com/tiles/JL4BwWcjcPuWhBm9/arcgis/rest/services/PonderosaElementary_20190328/MapServer',
    attribution: '',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: -1,
      opacity: 0.5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
  {
    id: 515,
    name: 'AchieveCharterSchool_20190328',
    type: 'arcgis',
    url: 'https://tiles.arcgis.com/tiles/JL4BwWcjcPuWhBm9/arcgis/rest/services/AchieveCharterSchool_20190328/MapServer',
    attribution: '',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: -4,
      opacity: 0.5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
  {
    id: 516,
    name: 'Hospital_20190329',
    type: 'arcgis',
    url: 'https://tiles.arcgis.com/tiles/JL4BwWcjcPuWhBm9/arcgis/rest/services/Hospital_20190329/MapServer',
    attribution: '',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: -3,
      opacity: 0.5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
  {
    id: 648,
    name: 'Global Multi-Resolution Topography (GMRT) Synthesis',
    type: 'wms',
    url: 'https://www.gmrt.org/services/mapserver/wms_merc?request=GetCapabilities&service=WMS&version=1.3.0',
    attribution:
      'The Global Multi-Resolution Topography (GMRT) synthesis is a multi-resolution gridded compilation of edited multibeam sonar bathymetry data from the global and polar oceans, merged with terrestrial and lower resolution ocean data from GEBCO. Seafloor bathymetric data acquired with multibeam sonars are used for a wide range of fundamental research applications (e.g. on active seafloor geologic processes, bottom water circulation, biological habitats), as well as for more applied needs (e.g. marine resource management, tsunami inundation, submarine navigation). However these data have been acquired for only a small fraction of the oceans and typically require specialist knowledge to process. The GMRT is the only global-scale compilation of these data, providing access to grids and images to the full native resolution of the data, as well as attribution to the original data sources and is intended for broad use for research and education. The GMRT also serves the terrestrial community by providing easy access to images or grids from NASA\u2019s ASTER terrestrial elevation data (30-m resolution) for the globe and the USGS National Elevation Dataset (NED) (10-m resolution) for portions of the US. New source swath sonar data are obtained from NOAA\u2019s NGDC and other sources, and are evaluated, cleaned, edited, and then merged into the multi-resolution DEM. The GMRT synthesis is provided with funding from the U.S. National Science Foundation. Collaboration with Google has resulted in publication of the GMRT multibeam content in Google Earth, and GMRT content has routinely been contributed to GEBCO since 2015. Further details on the architecture of the GMRT are available in Ryan et al. (2009) and from http://www.marine-geo.org/portals/gmrt/about.php.',
    tileOptions: {
      layers: 'GMRT',
    },
    uiOptions: {
      zIndex: 0,
      opacity: 0.5,
      isActive: true,
    },
  },
];
