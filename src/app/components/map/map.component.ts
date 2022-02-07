import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';
import {LatLng} from 'leaflet';
import '@bagage/leaflet.vectorgrid';
import {Viewer, ViewerOptions} from 'mapillary-js';
import { ProjectsService} from '../../services/projects.service';
import { GeoDataService} from '../../services/geo-data.service';
import { createMarker } from '../../utils/leafletUtils';
import {Feature} from 'geojson';
import {FeatureGroup, Layer, LayerGroup, LeafletMouseEvent, TileLayer} from 'leaflet';
import * as turf from '@turf/turf';
import { AllGeoJSON } from '@turf/helpers';
import {filter, map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {Overlay, Project, TileServer} from '../../models/models';
import {Streetview} from '../../models/streetview';
import {EnvService} from '../../services/env.service';
import {StreetviewService} from 'src/app/services/streetview.service';
import {StreetviewAuthenticationService} from 'src/app/services/streetview-authentication.service';
import {ActivatedRoute} from '@angular/router';
import { streetviewAssetStyles } from '../../utils/streetview';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit, OnDestroy {
  map: L.Map;
  mapType = 'normal';
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  mapillarySequences: FeatureGroup = new FeatureGroup();
  projectMapillarySequences: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  streetviews: LayerGroup = new LayerGroup<any>();
  tileServerLayers: Map<number, TileLayer> = new Map<number, TileLayer>();
  fitToFeatureExtent = true;
  private subscription: Subscription = new Subscription();
  streetviewFeatures: FeatureGroup = new FeatureGroup();
  streetviewViewer: any = null;
  streetviewViewerOn = false;
  streetviewMarker: any = null;
  mapWidth = 100;
  activeStreetview: Streetview;
  activeStreetviewAsset: any;
  selectedStreetviewAsset = {
    sequence: {
      id: '',
      instance: false
    },
    image: {
      id: '',
      instance: false
    },
  };

  mapillaryLayer: any;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private envService: EnvService,
              private route: ActivatedRoute,
              private streetviewService: StreetviewService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
             ) {
    // Have to bind these to keep this being this
    this.featureClickHandler.bind(this);
    this.mouseEventHandler.bind(this);
  }

  ngOnInit() {
    this.map = new L.Map('map', {
      center: [40, -80],
      zoom: 3,
      maxZoom: 19
    });

    this.subscription.add(this.geoDataService.tileServers.subscribe((next: Array<TileServer>) => {
      // remove any layers that no longer exist from tileServerLayers
      const currentTileLayerIds = new Set<number>(next.map(l => l.id));
      for (const tileLayerId of this.tileServerLayers.keys()) {
        if (!currentTileLayerIds.has(tileLayerId)) {
          if (this.map.hasLayer(this.tileServerLayers.get(tileLayerId))) {
            this.map.removeLayer(this.tileServerLayers.get(tileLayerId));
          }
          this.tileServerLayers.delete(tileLayerId);
        }
      }

      // update/add layers
      next.forEach((ts) => {
        if (!this.tileServerLayers.has(ts.id)) {
          this.tileServerLayers.set(ts.id, this.tileServerToLayer(ts));
        }

        this.tileServerLayers.get(ts.id).setZIndex(ts.uiOptions.zIndex);
        this.tileServerLayers.get(ts.id).setOpacity(ts.uiOptions.opacity);

        if (ts.uiOptions.isActive) {
          this.map.addLayer(this.tileServerLayers.get(ts.id));
        } else {
          this.map.removeLayer(this.tileServerLayers.get(ts.id));
        }
      });
    }));

    // TOOD: Remove this and just display on init
    this.subscription.add(this.streetviewService.displayStreetview.subscribe((next: boolean) => {
      if (this.activeStreetview) {
        const vectorTileStyling = {
          sequence: (properties, zoom, geometryType) => {
            if (this.activeStreetview.organizations.some(org => org.key == properties.organization_id)) {
              if (this.streetviewAuthenticationService.sequenceInStreetview(properties.id)) {
                return streetviewAssetStyles.instance.sequence.default;
              } else {
                return streetviewAssetStyles.sequence.default;
              }
            } else {
              return [];
            }
          },
          image: [],
          overview: []
        };

        const vectorTileOptions = {
          attribution: 'Mapillary layer',
          vectorTileLayerStyles: vectorTileStyling,
          token: 'MLYARDcnHyGduYMTxCn5gVuhZCFPHQAFhZBUX1JGw25udGnTa6YunU3UYUZBsmiIykVApTBwxHguCyTZAdGvHavJ6O7mr3uPA3ZC3ZCOwkTg2HiVR8AoR5Om2Dhw2vAOawgZDZD',
          // token: 'MLYARBbnSgSlSCZBYiOSlbKk5s271PF5EJm61bhLznIARyPmasuP1tZAAZBZAAArhughs5ZAyElJ9L0ZC2CBPJhIjQt0jL7bWzHI2Ym6ZAaxH9eWgvCnMob0kiZAvBhBysdwgZDZD',
          interactive: true,
          getFeatureId: (f: any) => {
            return f.properties.id;
          }
        };

        const vectorTileUrl = 'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token={token}';
        this.mapillaryLayer = L.vectorGrid.protobuf(vectorTileUrl, vectorTileOptions).addTo(this.map);

        this.mapillaryLayer.on('click', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          if (prop.image_id) {
            if (this.map.getZoom() === 14) {
              this.openOrMoveStreetviewViewer(prop.image_id, e.latlng);
            } else {
              this.map.setView(e.latlng, 14);
            }
            this.mapillarySelectAsset('sequence', prop.id, prop.id);
          } else {
            this.openOrMoveStreetviewViewer(prop.id, e.latlng);
            this.mapillarySelectAsset('image', prop.id, prop.sequence_id);
            this.mapillarySelectAsset('sequence', prop.sequence_id, prop.sequence_id);
          }
        });

        this.mapillaryLayer.on('contextmenu', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          this.streetviewService.activeAsset = e;
          if (prop.image_id) {
            this.mapillarySelectAsset('sequence', prop.id, prop.id);
          } else {
            this.mapillarySelectAsset('image', prop.id, prop.sequence_id);
            this.mapillarySelectAsset('sequence', prop.sequence_id, prop.sequence_id);
          }

        });

        this.mapillaryLayer.on('mouseout', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          if (prop.image_id) {
            this.mapillaryHoverAsset('sequence', prop.id, prop.id, false);
          } else {
            this.mapillaryHoverAsset('image', prop.id, prop.sequence_id, false);
          }
        });

        this.mapillaryLayer.on('mouseover', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          if (prop.image_id) {
            this.mapillaryHoverAsset('sequence', prop.id, prop.id, true);
          } else {
            this.mapillaryHoverAsset('image', prop.id, prop.sequence_id, true);
          }
        });

      } else {
        if (this.mapillaryLayer) {
          this.map.removeLayer(this.mapillaryLayer);
        }
      }
    }));

    // Subscribe to active project and features
    this.subscription.add(this.loadFeatures());

    this.subscription.add(this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview= sv;
    }));

    this.subscription.add(this.streetviewService.activeAsset.subscribe((asset: any) => {
      this.activeStreetviewAsset = asset;
    }));

    // Publish the mouse location on the mapMouseLocation stream
    this.map.on('mousemove', (ev: LeafletMouseEvent) => this.mouseEventHandler(ev));

    // Filter out and display only the active overlays
    this.subscription.add(this.geoDataService.selectedOverlays$
      .pipe(
        map( (items: Array<Overlay>) => items.filter( (item: Overlay) => item.isActive))
      )
      .subscribe( (filteredOverlays: Array<Overlay>) => {
        this.overlays.clearLayers();
        filteredOverlays.forEach( (item: Overlay) => {
          this.overlays.addLayer(this.createOverlayLayer(item));
        });
        this.overlays.addTo(this.map);
      }));

    // Listen on the activeFeature stream and zoom map to that feature when it changes
    this.subscription.add(this.geoDataService.activeFeature.pipe(filter(n => n != null)).subscribe( (next) => {
      this.activeFeature = next;
      const bbox = turf.bbox(<AllGeoJSON> next);
      this.map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
    }));

    this.subscription.add(this.streetviewService.assetDetailEvent.subscribe((ev: any) => {
      if (ev) {
        switch (ev.type) {
          case 'close':
            this.mapillaryDeselectAll();
            break;
          case 'viewer':
            if (ev.asset.properties.image_id) {
              this.openOrMoveStreetviewViewer(ev.asset.properties.image_id, ev.asset.latlng);
            } else {
              this.openOrMoveStreetviewViewer(ev.asset.properties.id, ev.asset.latlng);
            }
            break;
          default:
            break;
        }
      }
    }));

    this.subscription.add(this.streetviewService.sequenceFocusEvent.subscribe((ev: any) => {
      this.streetviewService.displayStreetview = true;
      if (ev) {
        this.map.setView(ev.latlng, 13);
        this.mapillarySelectAsset('sequence', ev.id, ev.id);
      }
    }));
  }

  createOverlayLayer(ov: Overlay): Layer {
    return L.imageOverlay(this.envService.apiUrl + '/assets/' + ov.path, [[ov.minLat, ov.minLon], [ov.maxLat, ov.maxLon]]);
  }

  // TODO: Might have to use NgZone with this, I think that any mouse event is triggering change detection.
  mouseEventHandler(ev: any): void {
    this.geoDataService.mapMouseLocation = ev.latlng;
  }

  tileServerToLayer(ts: TileServer): TileLayer {
    const layerOptions = {
      attribution: ts.attribution,
      ...ts.tileOptions
    };

    if (ts.type === 'tms') {
      return L.tileLayer(ts.url, layerOptions);
    } else if (ts.type === 'wms') {
      return L.tileLayer.wms(ts.url, layerOptions);
    }
  }

  /**
   * Load Features for a project.
   *
   * @returns Subscription subscription created
   */
  loadFeatures() {
    const geojsonOptions = {
      pointToLayer: createMarker
    };

    const subscription = this.geoDataService.features.subscribe((collection) => {
      this.features.clearLayers();
      this.overlays.clearLayers();
      const markers = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'});
        }
      });

      collection.features.forEach(d => {
        let feat: LayerGroup;
        if (d.geometry.type === 'Polygon' && d.properties.style) {
          feat = L.geoJSON(d, {style: d.properties.style});
        } else {
          feat = L.geoJSON(d, geojsonOptions);
        }

        feat.on('click', (ev) => { this.featureClickHandler(ev); } );

        feat.setZIndex(1);

        if (d.geometry.type === 'Point') {
          markers.addLayer(feat);
        } else {
          this.features.addLayer(feat);
        }
      });
      this.features.addLayer(markers);
      this.map.addLayer(this.features);
      try {
        if (this.fitToFeatureExtent) {
          this.fitToFeatureExtent = false;
          this.map.fitBounds(this.features.getBounds());
        }
      } catch (e) {}
    });

    subscription.add(this.projectsService.activeProject.subscribe((next: Project) => {
      // fit to bounds if this is a new project
      if (next && this._activeProjectId !== next.id) {
        this.fitToFeatureExtent = true;
      }
      this._activeProjectId = next ? next.id : null;
    }));

    return subscription;
  }

  /**
   * @param ev
   */
  featureClickHandler(ev: any): void {
    const f = ev.layer.feature;
    this.geoDataService.activeFeature = f;
  }

  showStreetviewMarker(latlng: LatLng) {
    this.map.setView(latlng, 14);
    console.log(14);
    if (!this.streetviewMarker) {
      this.streetviewMarker = L.marker(latlng).addTo(this.map);
    } else {
      this.streetviewMarker.setLatLng(latlng);
    }
  }

  openOrMoveStreetviewViewer(imageId: string, latlng: any) {
    if (this.streetviewViewer) {
      this.streetviewViewer.moveTo(imageId).catch(() => {});
    } else {
      this.openStreetviewViewer(imageId);
    }

    this.openOrMoveStreetviewMarker(latlng);
  }

  openOrMoveStreetviewMarker(latlng: any) {
    if (this.streetviewMarker) {
      this.streetviewMarker.setLatLng(latlng);
    } else {
      this.streetviewMarker = L.marker(latlng).addTo(this.map);
    }
    this.map.setView(latlng, 14);
  }

  openStreetviewViewer(imageId: string) {
    this.streetviewViewerOn = true;
    setTimeout(() => {
      const options: ViewerOptions = {
        accessToken: this.streetviewAuthenticationService.getLocalToken('mapillary').token,
        component: {
          cover: false,
        },
        container: 'mapillary'
      };
      this.streetviewViewer = new Viewer(options);

      if (this.streetviewViewer) {
        this.streetviewViewer.moveTo(imageId).catch(() => {});
      }

      this.streetviewViewer.on('image', (img) => {
        this.openOrMoveStreetviewMarker([
          img.image._core.geometry.lat,
          img.image._core.geometry.lng
        ]);
        window.addEventListener('resize', () => this.streetviewViewer.resize());
      });
    }, 400);
    this.mapWidth = 50;
    setTimeout(() => this.map.invalidateSize(), 400);
  }

  closeStreetviewViewer() {
    if (this.streetviewViewer) {
      this.streetviewViewer.remove();
      this.streetviewViewer = null;
      this.streetviewViewerOn = false;
      this.mapWidth = 100;
      setTimeout(() => this.map.invalidateSize(), 400);
    }

    if (this.streetviewMarker) {
      this.streetviewMarker.remove();
      this.streetviewMarker = null;
    }

    this.mapillaryDeselectAll();
  }

  mapillaryHoverAsset(assetType: string, assetId: string, sequenceId: string, mouseAction: boolean) {
    const isInstance = this.streetviewAuthenticationService.sequenceInStreetview(sequenceId);

    const prevAsset = this.selectedStreetviewAsset[assetType];

    const assetStyle = streetviewAssetStyles[assetType];
    const instanceAssetStyle = streetviewAssetStyles.instance[assetType];

    const newAssetStyle = isInstance ?
      instanceAssetStyle :
      assetStyle;

    const hoverStyle = mouseAction ?
      newAssetStyle.hover :
      newAssetStyle.default;

    if (assetId !== prevAsset.id) {
      this.mapillaryLayer.setFeatureStyle(assetId, hoverStyle);
    }
  }

  mapillarySelectAsset(assetType: string, assetId: string, sequenceId: string) {
    const isInstance = this.streetviewAuthenticationService.sequenceInStreetview(sequenceId);
    const prevAsset = this.selectedStreetviewAsset[assetType];

    const assetStyle = streetviewAssetStyles[assetType];
    const instanceAssetStyle = streetviewAssetStyles.instance[assetType];

    if (prevAsset.id) {
      const defaultAsset = prevAsset.instance ?
        instanceAssetStyle.default :
        assetStyle.default;

      this.mapillaryLayer.setFeatureStyle(
        prevAsset.id,
        defaultAsset
      );
    }

    const selectStyle = isInstance ?
      instanceAssetStyle.select :
      assetStyle.select;

    this.mapillaryLayer.setFeatureStyle(
      assetId,
      selectStyle
    );

    this.selectedStreetviewAsset[assetType].id = assetId;
    this.selectedStreetviewAsset[assetType].instance = isInstance;
  }

  mapillaryDeselectAsset(assetType: string) {
    this.mapillaryLayer.setFeatureStyle(
      this.selectedStreetviewAsset[assetType].id,
      streetviewAssetStyles[assetType].default
    );
    this.selectedStreetviewAsset[assetType].id = '';
  }

  // TODO: Consider instances
  mapillaryDeselectAll() {
    this.mapillaryDeselectAsset('image');
    this.mapillaryDeselectAsset('sequence');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
