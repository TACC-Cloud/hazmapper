import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';

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
  mapType = 'normal';
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  streetviewFeatures: FeatureGroup = new FeatureGroup();
  environment: AppEnvironment;
  fitToFeatureExtent: boolean = true;

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
    });
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

    this.streetviewService.streetviewSequences.subscribe((sequences) => {
      this.streetviewFeatures.clearLayers();
      const markers = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'})
        }
      });
      sequences.forEach(seq => {
        let featureList = seq.feature.features;
        if (featureList.length > 0) {
          featureList.forEach(d => {
            const feat = L.geoJSON(d, geojsonOptions);
            feat.on('click', (ev) => { console.log(ev, d.properties.key); });

            // TODO: This has to be LineString...
            if (d.geometry.type === 'Point') {
              markers.addLayer(feat);
            } else {
              this.streetviewFeatures.addLayer(feat);
            }
          });
        }
      });
      this.streetviewFeatures.addLayer(markers);
      this.map.addLayer(this.streetviewFeatures);
      // try {
      //   if (this.fitToFeatureExtent) {
      //     this.fitToFeatureExtent = false;
      //     this.map.fitBounds(this.streetviewFeatures.getBounds());
      //   }
      // } catch (e) {}
    });



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

  // TODO: Need actual images for this to work properly
  streetviewFeatureClickHandler(ev: any): void {
    const f = ev.layer.feature;
    this.geoDataService.activeFeature = f;
  }
}
