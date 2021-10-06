import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';
import {LatLng} from 'leaflet';
import '@bagage/leaflet.vectorgrid';
// import 'leaflet.vectorgrid';
// import * as Mapillary from 'mapillary-js';
import {Viewer, ViewerOptions, RenderMode, CameraControls, TransitionMode} from 'mapillary-js';
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
import {EnvService} from '../../services/env.service';
import {StreetviewService} from 'src/app/services/streetview.service';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ActivatedRoute } from '@angular/router';

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
  imageMode = false;
  activeStreetviewAsset: any;

  //       Should make a default filter and mutate state on that like redux
  mapillaryLayer: any;
  mapillaryFilter = {

  };

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

    this.subscription.add(this.streetviewService.displayStreetview.subscribe((next: boolean) => {
      if (next) {
        // TODO: Wrap all of this mapillary segement in service that triggers on/off state of mapillary tiles (should only fire once)
        // Also when enabled => it should set zoom to 6
        // this.map.setZoom(6);
        const vectorTileStyling = {
          sequence: (properties, zoom, geometryType) => {
            if (zoom === 14) {
              return [];
            } else {
              // if (properties.organization_id === 904845143524564) {
              //   if (this.streetviewAuthenticationService.sequenceInStreetview(properties.id)) {
              return {
                fill: true,
                weight: 10,
                fillColor: '#06cccc',
                color: '#06cccc',
                fillOpacity: 0.2,
                opacity: 0.4
              };
              // } else {
              //   return {
              //     fill: true,
              //     weight: 2,
              //     fillColor: '#06cccc',
              //     color: '#06cccc',
              //     fillOpacity: 0.2,
              //     opacity: 0.4
              //   };
              // }
              // } else {
              //   return [];
              // }
            }
          },
          image: (properties, zoom, geometryType) => {
            this.imageMode = true;
            // Later
            // if (properties.organization_id === '') {
            //   if (this.streetviewAuthenticationService.sequenceInStreetview(properties.sequence_id)) {
            return {
              fill: true,
              weight: 2,
              fillColor: '#06cccc',
              color: '#06cccc',
              fillOpacity: 0.2,
              opacity: 0.4
            };
            // } 
            // else {
            //       return {
            //         fill: true,
            //         weight: 2,
            //         fillColor: '#06cccc',
            //         color: '#06cccc',
            //         fillOpacity: 0.2,
            //         opacity: 0.4
            //       };
            //     }
            //   } else {
            //     return [];
            //   }
          },
          overview: []
        };

        const vectorTileOptions = {
          // rendererFactory: L.canvas.tile,
          attribution: 'stuff',
          vectorTileLayerStyles: vectorTileStyling,
          token: 'MLYARDcnHyGduYMTxCn5gVuhZCFPHQAFhZBUX1JGw25udGnTa6YunU3UYUZBsmiIykVApTBwxHguCyTZAdGvHavJ6O7mr3uPA3ZC3ZCOwkTg2HiVR8AoR5Om2Dhw2vAOawgZDZD',
          interactive: true,
          getFeatureId: (f: any) => {
            return f.properties.id;
          }
        };

        const vectorTileUrl = 'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token={token}';
        this.mapillaryLayer = L.vectorGrid.protobuf(vectorTileUrl, vectorTileOptions).addTo(this.map);
        console.log(this.mapillaryLayer)

        this.mapillaryLayer.on('click', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          // NOTE: Determines whether point or segment
          if (prop.image_id) {
            this.imageMode = true;
            this.map.setView(e.latlng, 14);
          } else {
            this.openOrMoveStreetviewViewer(prop.id, e.latlng);
            // console.log('image!');
            // TODO: Open mapillary viewer here (show selected sequence in image)
          }
        });

        this.mapillaryLayer.on('contextmenu', (e) => {
          const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
          this.streetviewService.activeAsset = prop;
          // NOTE: Determines whether point or segment
          if (prop.image_id) {
            console.log('sequence!');
          } else {
            console.log('image!');
          }
        });

        //     this.mapillaryLayer.on('mouseout', (e) => {
        //       const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
        //       // this.mapillaryLayer.resetFeatureStyle(prop.id);
        //       if (prop.image_id) {
        //         if (this.imageMode) {
        //           console.log('image mode man')
        //         } else {
        //           this.mapillaryLayer.setFeatureStyle(prop.id, {
        //             color: '#06cccc',
        //             fillColor: '#06cccc'
        //           });
        //         }
        //       } else {
        //         console.log("In a n image mousein")
        //         // this.mapillaryLayer.setFeatureStyle(prop.id, {
        //         //   color: '#06cccc',
        //         //   fillColor: '#06cccc'
        //         // });
        //       }
        //     });

        // this.mapillaryLayer.on('mouseover', (e) => {
        //   const prop = e.layer.feature ? e.layer.feature.properties : e.layer.properties;
        //   if (prop.image_id) {
        //     if (this.imageMode) {
        //       console.log('image mode man')
        //     } else {
        //       this.mapillaryLayer.setFeatureStyle(prop.id, {
        //         color: '#ff0000',
        //         fillColor: '#ff0000'
        //       });
        //     }
        //   } else {
        //     console.log("In a n image mouseover")
        //     // this.mapillaryLayer.setFeatureStyle(prop.id, {
        //     //   color: '#ff0000',
        //     //   fillColor: '#ff0000'
        //     // });
        //   }
        // });

      } else {
        if (this.mapillaryLayer) {
          this.map.removeLayer(this.mapillaryLayer);
        }
      }
    }));

    // Subscribe to active project and features
    this.subscription.add(this.loadFeatures());

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

  // setFilterOptions(style: any) {
  //   L.vectorGrid.setFeatureStyle(this.mapillaryLayer.getFeatureId(), style);
  // }


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

      collection.features.forEach( d => {
        const feat = L.geoJSON(d, geojsonOptions);
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
    if (!this.streetviewMarker) {
      this.streetviewMarker = L.marker(latlng).addTo(this.map);
    } else {
      this.streetviewMarker.setLatLng(latlng);
    }
  }

  openOrMoveStreetviewViewer(imageId: string, latlng: any) {
    console.log(this.streetviewViewer);
    if (this.streetviewViewer) {
      console.log('awesome')
      this.streetviewViewer.moveTo(imageId);
    } else {
      this.openStreetviewViewer(imageId, latlng);
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

  openStreetviewViewer(imageId: string, latlng: any) {
    this.streetviewViewerOn = true;
    setTimeout(() => {
      console.log(this.streetviewAuthenticationService.getLocalToken('mapillary').token)
      console.log(imageId);
      const options: ViewerOptions = {
        accessToken: this.streetviewAuthenticationService.getLocalToken('mapillary').token,
        component: {
          cover: false,
        },
        container: 'mapillary',
        cameraControls: CameraControls.Street,
        combinedPanning: false,
        imageId,
        imageTiling: false,
        renderMode: RenderMode.Letterbox,
        trackResize: false,
        transitionMode: TransitionMode.Instantaneous,
      };
      this.streetviewViewer = new Viewer(options);

      this.streetviewViewer.on('image', (img) => {
        this.openOrMoveStreetviewMarker([
          img.image._core.geometry.lat, 
          img.image._core.geometry.lng
        ]);
        window.addEventListener('resize', () => this.streetviewViewer.resize());
      });
    }, 1000);
    this.mapWidth = 50;
  }

  closeStreetviewViewer() {
    if (this.streetviewViewer) {
      this.streetviewViewer.remove();
      this.streetviewViewer = null;
      this.streetviewViewerOn = false;
      this.mapWidth = 100;
    }

    if (this.streetviewMarker) {
      this.streetviewMarker.remove();
      this.streetviewMarker = null;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
