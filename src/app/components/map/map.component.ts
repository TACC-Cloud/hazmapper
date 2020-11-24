import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer, BitmapLayer} from '@deck.gl/layers';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import mapboxgl from 'mapbox-gl';
import {MapboxLayer} from '@deck.gl/mapbox';
import {TileLayer} from '@deck.gl/geo-layers';
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit {
  // map: L.Map;
  map: mapboxgl.Map;
  deckgl: any;
  mapType = 'normal';
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  environment: AppEnvironment;
  fitToFeatureExtent: boolean = true;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private route: ActivatedRoute,
              ) {

    // Have to bind these to keep this being this
    this.featureClickHandler.bind(this);
    this.mouseEventHandler.bind(this);
  }

  ngOnInit() {
    const INITIAL_VIEW_STATE = {
      latitude: 40,
      longitude: -75,
      pitch: 45,
      maxPitch: 60,
      bearing: 0,
      minZoom: 2,
      maxZoom: 30,
      zoom: 17
    };

    const ION_ASSET_ID = 43978;
    const ION_TOKEN =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWMxMzcyYy0zZjJkLTQwODctODNlNi01MDRkZmMzMjIxOWIiLCJpZCI6OTYyMCwic2NvcGVzIjpbImFzbCIsImFzciIsImdjIl0sImlhdCI6MTU2Mjg2NjI3M30.1FNiClUyk00YH_nWfSGpiQAjR5V2OvREDq1PJ5QMjWQ';
    const TILESET_URL = `https://assets.cesium.com/${ION_ASSET_ID}/tileset.json`;

    const myDeckLayer = new MapboxLayer({
      id: 'tile-3d-layer',
      type: Tile3DLayer,
      pointSize: 2,
      data: TILESET_URL,
      loader: CesiumIonLoader,
      loadOptions: {'cesium-ion': {accessToken: ION_TOKEN}}
    });

    mapboxgl.accessToken = 'pk.eyJ1Ijoic290bHBhcmsiLCJhIjoiY2todjE3M2IzMTFiczJ0cGdmOW9veGJtdyJ9.ZaGwR31atjWTDnEbTcFKGA';

    this.map = new mapboxgl.Map({
      sources: [],
      layers: {},
      container: 'map',
      center: [-80, 40],
      maxZoom: 19,
      minZoom: 0,
      pitch: 45,
      zoom: 3
    });

    this.map.on('load', () => {
      this.map.addLayer(myDeckLayer);
    });

    this.environment = environment;

    const baseOSMLayer = {
      'id': 'base-osm-layer',
      'version': 8,
      "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      'type': 'raster',
      'source': {
        'type': 'raster',
        'tiles': [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution':
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      'minzoom': 0,
      'maxzoom': 19
    }

    const satelliteLayer = {
      'id': 'satellite-layer',
      'version': 8,
      "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      'type': 'raster',
      'source': {
        'type': 'raster',
        'tiles': [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        'tileSize': 256,
        'attribution':
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      },
      'minzoom': 0,
      'maxzoom': 19
    }

    this.map.addLayer(baseOSMLayer);
    this.map.addLayer(satelliteLayer);

    this.loadFeatures();

    // Publish the mouse location on the mapMouseLocation stream
    this.map.on('mousemove', (ev: any) => this.mouseEventHandler(ev));

    // Filter out and display only the active overlays
    this.geoDataService.selectedOverlays$
      .pipe(
        map( (items: Array<Overlay>) => items.filter( (item: Overlay) => item.isActive))
      )
      .subscribe( (filteredOverlays: Array<Overlay>) => {
        this.overlays.clearLayers();
        filteredOverlays.forEach( (item: Overlay) => {
          // this.overlays.addLayer(this.createOverlayLayer(item));
        });
        // this.overlays.addTo(this.map);
    });


    // Listen on the activeFeature stream and zoom map to that feature when it changes
    this.geoDataService.activeFeature.pipe(filter(n => n != null)).subscribe( (next) => {
      this.activeFeature = next;
      const bbox = turf.bbox(<AllGeoJSON> next);
      this.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
        padding: 20,
        maxZoom: 17
      });
    });

    // Listen for changes to the basemap
    this.geoDataService.basemap.subscribe((next: string) => {
      if (next === 'sat') {
        this.map.setLayoutProperty(baseOSMLayer.id, 'visibility', 'none');
        this.map.setLayoutProperty(satelliteLayer.id, 'visibility', 'visible');
      }
      if (next === 'roads') {
        this.map.setLayoutProperty(satelliteLayer.id, 'visibility', 'none');
        this.map.setLayoutProperty(baseOSMLayer.id, 'visibility', 'visible');
      }
    });
  }

  createOverlayLayer(ov: Overlay): Layer {
    return L.imageOverlay(environment.apiUrl + '/assets/' + ov.path, [[ov.minLat, ov.minLon], [ov.maxLat, ov.maxLon]]);
  }

  // TODO: Might have to use NgZone with this, I think that any mouse event is triggering change detection.
  mouseEventHandler(ev: any): void {
    this.geoDataService.mapMouseLocation = ev.lngLat;
  }


  /**
   * Load Features for a project.
   */
  loadFeatures() {
    const geojsonOptions = {
      pointToLayer: createMarker
    };

    this.geoDataService.features.subscribe((collection) => {
      if (collection.features.length > 0) {
        this.map.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image) => {
            if (error) throw error;
            this.map.addImage('custom-marker', image);
            // Add a GeoJSON source with 2 points
            this.map.addSource('points', {
              'type': 'geojson',
              'data': collection,
              'cluster': true,
              'clusterMaxZoom': 14, // Max zoom to cluster points on
              'clusterRadius': 50 // Radius of each cluster when clustering points (defaults to 50)
            });

            this.map.addLayer({
              id: 'clusters',
              type: 'circle',
              source: 'points',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#51bbd6',
                  100,
                  '#f1f075',
                  750,
                  '#f28cb1'
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40
                ]
              }
            });

            this.map.addLayer({
              id: 'cluster-count',
              type: 'symbol',
              source: 'points',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
              }
            });

            this.map.addLayer({
              id: 'unclustered-point',
              type: 'circle',
              source: 'points',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': '#11b4da',
                'circle-radius': 10,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
              }
            });

            // inspect a cluster on click
            this.map.on('click', 'clusters', (e) => {

              var features = this.map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
              });
              console.log(features);

              var clusterId = features[0].properties.cluster_id;
              this.map.getSource('points').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                  if (err) return;

                  this.map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                  });
                }
              );
            });

          }
        );
      }
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
}
