# Supported Asset Types<a id='supported-asset-types'></a>

## Map Associated Assets<a id='map-associated-assets'></a>
### Media Assets
Currently, we support the following media assets.
Note that these assets must have geospatial data (lat/lon) for Hazmapper to properly process and handle them.
If the image is problematic, Hazmapper should show an error during the import process.

- Image Assets:
jpeg, jpg, png

- Video Assets:
mp4, mov, mpeg4, webm

- GeoJSON/Shapefiles


### Point Cloud Assets
Point cloud assets are represented as bounding boxes showing their respective geographic locations.

They can be analyzed further through the Potree Viewer, which shows a 3D model of the point cloud.

### Imported Streetview Assets<a id='imported-streetview-assets'></a>
These are imported versions of mapillary streetview assets and bound to the map (different from [non-imported streetview assets](assets.md#non-imported-streetview-assets) shown and accessed through the [Streetview panel](interface.md#streetview-panel)).

Thus, they can be shared among users of the map and with those who have access to the public link map if the map has a public version.

### Tile Layers<a id='supported-tile-formats'></a>
These are tile layers from an external tile server. They are managed through the [Layers panel](interface.md#layers-panel).

Currently, supported formats are:

- TMS
- WMS
- ArcGIS Tile Server
- `.ini` file containing tms/wms information
- Formats accessible through [Quick Map Services](https://qms.nextgis.com/)

**NOTE**: *Tile layers are not regular Feature Assets (i.e. they do not show up in the assets panel), but they are part of the map and can be shared among collaborators and those with access to the public version of the map.*

<!-- TODO -->
<!-- #### Shapefiles -->

<!-- #### Overlays -->

<!-- #### Coming Soon -->
<!-- KML and KMZ (Coming Soon!) -->


## Third-party Assets

### Non-imported Streetview Assets<a id='non-imported-streetview-assets'></a>
These are supported through a Mapillary's tile service. Because these are user-dependent services, they cannot be shared among users of a map. Thus, they must be [imported](interface.md#importing-streetview-assets) as [imported streetview assets](interface.md#imported-streetview-assets)

