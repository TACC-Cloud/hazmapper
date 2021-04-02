import { Component, OnInit } from '@angular/core';
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
import {FeatureGroup, ImageOverlay, LatLng, Layer, LayerGroup, LeafletMouseEvent} from 'leaflet';
import * as turf from '@turf/turf';
import { AllGeoJSON } from '@turf/helpers';
import { combineLatest } from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Overlay, Project} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit {

  map: L.Map;
  mapillaryViewer: any;
  mapType = 'normal';
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  mapillarySequences: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  streetviewFeatures: FeatureGroup = new FeatureGroup();
  environment: AppEnvironment;
  fitToFeatureExtent: boolean = true;
  mapillaryStreetview: boolean = false;
  streetviewMarker: any;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
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
    this.environment = environment;
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

      this.map = new L.Map('map', {
        center: [40, -80],
        zoom: 3
      });

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

      this.streetviewService.streetviewDisplaySequences.subscribe((collection) => {
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
      });

      this.loadFeatures();

      // Publish the mouse location on the mapMouseLocation stream
      this.map.on('mousemove', (ev: LeafletMouseEvent) => this.mouseEventHandler(ev));

      // Filter out and display only the active overlays
      this.geoDataService.selectedOverlays$
        .pipe(
          map( (items: Array<Overlay>) => items.filter( (item: Overlay) => item.isActive))
        )
        .subscribe( (filteredOverlays: Array<Overlay>) => {
          this.overlays.clearLayers();
          filteredOverlays.forEach( (item: Overlay) => {
            this.overlays.addLayer(this.createOverlayLayer(item));
          });
          this.overlays.addTo(this.map);
        });


      // Listen on the activeFeature stream and zoom map to that feature when it changes
      this.geoDataService.activeFeature.pipe(filter(n => n != null)).subscribe( (next) => {
        this.activeFeature = next;
        const bbox = turf.bbox(<AllGeoJSON> next);
        this.map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
      });

      // Listen for changes to the basemap
      this.geoDataService.basemap.subscribe((next: string) => {
        if (next === 'sat') {
          this.map.removeLayer(baseOSM);
          this.map.addLayer(satellite);
        }
        if (next === 'roads') {
          this.map.removeLayer(satellite);
          this.map.addLayer(baseOSM);
        }
      })}, 10);
  }

  createOverlayLayer(ov: Overlay): Layer {
    return L.imageOverlay(environment.apiUrl + '/assets/' + ov.path, [[ov.minLat, ov.minLon], [ov.maxLat, ov.maxLon]]);
  }

  // TODO: Might have to use NgZone with this, I think that any mouse event is triggering change detection.
  mouseEventHandler(ev: any): void {
    this.geoDataService.mapMouseLocation = ev.latlng;
  }


  /**
   * Load Features for a project.
   */
  loadFeatures() {
    const geojsonOptions = {
      pointToLayer: createMarker
    };

    this.geoDataService.features.subscribe((collection) => {
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

    // this.streetviewService.mapillaryLines.subscribe((d: Feature) => {
    //   this.features.clearLayers();
    //   this.overlays.clearLayers();
    //   const markers = L.markerClusterGroup({
    //     iconCreateFunction: (cluster) => {
    //       return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'});
    //     }
    //   });
    //   const feat = L.geoJSON(d, geojsonOptions);
    //   // feat.on('click', (ev) => { this.featureClickHandler(ev); } );
    //   feat.on('click', (ev) => { this.featureClickHandler(ev, d.properties.key); } );

    //   if (d.geometry.type === 'Point') {
    //     markers.addLayer(feat);
    //   } else {
    //     this.features.addLayer(feat);
    //   }
    //   this.features.addLayer(markers);
    //   this.map.addLayer(this.features);
    //   try {
    //     if (this.fitToFeatureExtent) {
    //       this.fitToFeatureExtent = false;
    //       this.map.fitBounds(this.features.getBounds());
    //     }
    //   } catch (e) {}
    // });

    // this.streetviewService.mapillaryImages.subscribe((collection) => {
    //     this.features.clearLayers();
    //     this.overlays.clearLayers();
    //     const markers = L.markerClusterGroup({
    //       iconCreateFunction: (cluster) => {
    //         return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'});
    //       }
    //     });
    //     collection.features.forEach( d => {
    //       const feat = L.geoJSON(d, geojsonOptions);
    //       // feat.on('click', (ev) => { this.featureClickHandler(ev); } );
    //       feat.on('click', (ev) => { this.featureClickHandler(ev, d.properties.key); } );

    //       if (d.geometry.type === 'Point') {
    //         markers.addLayer(feat);
    //       } else {
    //         this.features.addLayer(feat);
    //       }
    //     });
    //     this.features.addLayer(markers);
    //     this.map.addLayer(this.features);
    //     try {
    //       if (this.fitToFeatureExtent) {
    //         this.fitToFeatureExtent = false;
    //         this.map.fitBounds(this.features.getBounds());
    //       }
    //     } catch (e) {}
    //   }
    // );

    // this.streetviewService.streetviewSequences.subscribe((sequences) => {
    // this.streetviewService.mapillaryImages.subscribe((sequences) => {
    //   this.streetviewFeatures.clearLayers();
    //   const markers = L.markerClusterGroup({
    //     iconCreateFunction: (cluster) => {
    //       return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'})
    //     }
    //   });
    //   sequences.features.forEach(seq => {
    //     // let featureList = seq.feature.features;
    //     // if (featureList.length > 0) {
    //     // seq.forEach(d => {
    //     const feat = L.geoJSON(seq, geojsonOptions);
    //     feat.on('click', (ev) => { console.log(ev, seq.properties.key); });

    //     // TODO: This has to be LineString...
    //     if (d.geometry.type === 'Point') {
    //       markers.addLayer(feat);
    //     } else {
    //       this.streetviewFeatures.addLayer(feat);
    //     }
    //     // });
    //     // }
    //   });
    //   this.streetviewFeatures.addLayer(markers);
    //   this.map.addLayer(this.streetviewFeatures);
    //   // try {
    //   //   if (this.fitToFeatureExtent) {
    //   //     this.fitToFeatureExtent = false;
    //   //     this.map.fitBounds(this.streetviewFeatures.getBounds());
    //   //   }
    //   // } catch (e) {}
    // });



    this.projectsService.activeProject.subscribe((next: Project) => {
      // fit to bounds if this is a new project
      if (next && this._activeProjectId != next.id) {
        this.fitToFeatureExtent = true;
      }
      this._activeProjectId = next ? next.id: null;
    });
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
}
