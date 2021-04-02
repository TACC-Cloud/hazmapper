import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet-contextmenu';
import * as Mapillary from 'mapillary-js';
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
// import {AppEnvironment, environment} from '../../../environments/environment';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit, OnDestroy {
  map: L.Map;
  mapillaryViewer: any;
  mapType = 'normal';
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  mapillarySequences: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  tileServerLayers: Map<number, TileLayer> = new Map<number, TileLayer>();
  fitToFeatureExtent = true;
  private subscription: Subscription = new Subscription();
  streetviewFeatures: FeatureGroup = new FeatureGroup();
  // environment: AppEnvironment;
  mapillaryStreetview: boolean = false;
  streetviewMarker: any;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private envService: EnvService,
              private route: ActivatedRoute,
              private streetviewService: StreetviewService,
             ) {
    // Have to bind these to keep this being this
    this.featureClickHandler.bind(this);
    this.mouseEventHandler.bind(this);
  }

  ngOnInit() {
    // const mapType: string = this.route.snapshot.queryParamMap.get('mapType');
    // this.projectId = +this.route.snapshot.paramMap.get("projectId");
    // this.cluster = this.route.snapshot.queryParamMap.get('mapType');
    // this.environment = environment;
    this.loadMap();
  }

  loadMap() {
    setTimeout(() => {
      // this.mapillaryViewer = new Mapillary.Viewer({
      //   apiClient: 'VDRaeGFzMEtzRnJrMFZwdVYzckd6cjo0ZWY3ZDEzZGIyMWJkZjNi',
      //   container: 'mapillary',
      //   imageKey: 'Qm9WROXi1LV37FgjTNUPZQ',
      // });
      // window.addEventListener('resize', () => { this.mapillaryViewer.resize(); });

      // this.map = new L.Map('map', {
      //   center: [40, -80],
      //   zoom: 3
      // });

      // this.loadFeatures();

      // // Publish the mouse location on the mapMouseLocation stream
      // this.map.on('mousemove', (ev: LeafletMouseEvent) => this.mouseEventHandler(ev));

      // // Filter out and display only the active overlays
      // this.geoDataService.selectedOverlays$
      //   .pipe(
      //     map( (items: Array<Overlay>) => items.filter( (item: Overlay) => item.isActive))
      //   )
      //   .subscribe( (filteredOverlays: Array<Overlay>) => {
      //     this.overlays.clearLayers();
      //     filteredOverlays.forEach( (item: Overlay) => {
      //       this.overlays.addLayer(this.createOverlayLayer(item));
      //     });
      //     this.overlays.addTo(this.map);
      //   });


      // // Listen on the activeFeature stream and zoom map to that feature when it changes
      // this.geoDataService.activeFeature.pipe(filter(n => n != null)).subscribe( (next) => {
      //   this.activeFeature = next;
      //   const bbox = turf.bbox(<AllGeoJSON> next);
      //   this.map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
      // });

      // // Listen for changes to the basemap
      // this.geoDataService.basemap.subscribe((next: string) => {
      //   if (next === 'sat') {
      //     this.map.removeLayer(baseOSM);
      //     this.map.addLayer(satellite);
      //   }
      //   if (next === 'roads') {
      //     this.map.removeLayer(satellite);
      //     this.map.addLayer(baseOSM);
      //   }
      // })}, 10);
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


      this.subscription.add(this.streetviewService.streetviewDisplaySequences.subscribe((collection) => {
        this.mapillarySequences.clearLayers();
        collection.features.forEach( d => {
          // NOTE: LineString
          const seq = L.geoJSON(d, { style: {
            weight: 10
          }});
          seq.on('click', (ev) => { this.sequenceClickHandler(ev); } );
          seq.on('contextmenu', (ev) => { this.sequenceRightClickHandler(ev); } );

          this.mapillarySequences.addLayer(seq);
        });
        this.map.addLayer(this.mapillarySequences);


        if (this.mapillarySequences.getBounds().getNorthEast()) {
          this.map.setView(this.mapillarySequences.getBounds().getNorthEast(), 15);
        }
      }));

      // Subscribe to active project and features
      this.subscription.add(this.loadFeatures());

      const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        // tslint:disable-next-line:max-line-length
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      // default to streetmap view;
      this.map.addLayer(baseOSM);


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
    })
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
    }

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
    }
                                                               );

    subscription.add(this.projectsService.activeProject.subscribe((next: Project) => {
      // fit to bounds if this is a new project
      if (next && this._activeProjectId !== next.id) {
        this.fitToFeatureExtent = true;
      }
      this._activeProjectId = next ? next.id: null;
    }));

    return subscription;
  }

  /**
   *
   * @param ev
   */
  featureClickHandler(ev: any): void {
    const f = ev.layer.feature;
    this.geoDataService.activeFeature = f;
  }

  sequenceClickHandler(ev: any): void {
    const lat = ev.latlng.lat;
    const lon = ev.latlng.lng;

    const query = lon + ',' + lat;

    this.streetviewService.searchMapillaryImages({
      'closeto': query,
      'lookat': query
    }, (resp) => {
      if (this.mapillaryStreetview) {
        this.mapillaryViewer.moveToKey(resp.features[0].properties.key);
        this.focusMarker(ev.latlng);
      } else {
        window.open("https://www.mapillary.com/map/im/" + resp.features[0].properties.key);
      }
    })


    // if (this.mapillaryStreetview) {
    //   if (this.openStreetview) {
    //     this.mapillaryViewer.moveCloseTo(lat, lon);
    //   }
    // } else {
    //   this.streetviewService.mapillaryOpenLatLng(lat, lon).subscribe(resp => {
    //     window.open("https://www.mapillary.com/map.im/" + resp.features[0].properties.key);
    //   });
    // }
  }

  sequenceRightClickHandler(ev: any): void {
    if (!this.mapillaryStreetview) {
      //   this.closeStreetview();
      // } else {
      this.openStreetview(ev.latlng);
    } else {
      this.sequenceClickHandler(ev);
    }
  }

  closeStreetview() {
    this.mapillaryStreetview = false;
    this.mapillaryViewer.remove();
    this.loadMap();
  }

  openStreetview(latlng: LatLng) {
    this.mapillaryStreetview = true;
    setTimeout(() => {
      if (this.mapillaryViewer && this.mapillaryStreetview)
        this.mapillaryViewer.remove();

      const query = latlng.lng + ',' + latlng.lat;

      this.streetviewService.searchMapillaryImages({
        'closeto': query,
        'lookat': query
      }, (resp) => {
        this.mapillaryViewer = new Mapillary.Viewer({
          apiClient: 'VDRaeGFzMEtzRnJrMFZwdVYzckd6cjo0ZWY3ZDEzZGIyMWJkZjNi',
          container: 'mapillary',
          imageKey: resp.features[0].properties.key,
        });

        this.mapillaryViewer.on(Mapillary.Viewer.nodechanged, (node) => {
          if (node) {
            if (node.latLon) {
              if (node.latLon.lat) {
                if (node.latLon.lon) {
                  this.map.setView({lat: node.latLon.lat, lng: node.latLon.lon}, 15)
                }
              }
            }
          }

          if (!this.streetviewMarker) {
            this.streetviewMarker = L.marker(node.latLon).addTo(this.map)
            this.streetviewMarker.setZIndex(1000)
          } else {
            this.streetviewMarker.setLatLng(node.latLon)
          }
        })

        window.addEventListener('resize', () => this.mapillaryViewer.resize());
        this.focusMarker(latlng);
      })
    }, 10)
    this.loadMap();
  }

  focusMarker(latlng: LatLng) {
    if (this.mapillaryStreetview) {
      this.map.setView(latlng, 15)
      if (!this.streetviewMarker) {
        this.streetviewMarker = L.marker(latlng).addTo(this.map)
        this.streetviewMarker.setZIndex(1000)
      } else {
        this.streetviewMarker.setLatLng(latlng)
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
