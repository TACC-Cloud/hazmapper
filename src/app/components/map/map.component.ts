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
import {Overlay, Project, TileServer} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';

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
  tileServers: Array<TileServer> = new Array<TileServer>();
  layers: any = {};
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
    // const mapType: string = this.route.snapshot.queryParamMap.get('mapType');
    // this.projectId = +this.route.snapshot.paramMap.get("projectId");
    // this.cluster = this.route.snapshot.queryParamMap.get('mapType');
    this.environment = environment;
    this.map = new L.Map('map', {
      center: [40, -80],
      zoom: 3,
      maxZoom: 19
    });

    const baseOSMObject: TileServer = {
      name: 'Base OSM',
      id: 1,
      type: 'tms',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      default: true,
      zIndex: 0,
      showDescription: false,
      opacity: 1,
      minZoom: 0,
      maxZoom: 19,
      isActive: true
    }

    const satelliteObject: TileServer = {
      name: 'Satellite',
      id: 1,
      type: 'tms',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      default: true,
      showDescription: false,
      opacity: 1,
      zIndex: 1,
      maxZoom: 19,
      isActive: false
    }

    // const wmsObject: TileServer = {
    //   name: 'Geology of Quebec: Bedrock Geology',
    //   id: 1,
    //   type: 'wms',
    //   url: 'https://servicesvectoriels.atlas.gouv.qc.ca/IDS_SGM_WMS/service.svc/get',
    //   attribution: 'temporary',
    //   layers: 'SGM:Contacts_discordants,SGM:Plis_regionaux,SGM:Failles_regionales,SGM:Geologie_regionale,SGM:Geologie_generale',
    //   default: true,
    //   zIndex: 1,
    //   isActive: false
    // }

    // this.geoDataService.addTileServer(baseOSMObject);
    // this.geoDataService.addTileServer(satelliteObject);
    // this.geoDataService.addTileServer(wmsObject);

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
  }

  createOverlayLayer(ov: Overlay): Layer {
    return L.imageOverlay(environment.apiUrl + '/assets/' + ov.path, [[ov.minLat, ov.minLon], [ov.maxLat, ov.maxLon]]);
  }

  // TODO: Might have to use NgZone with this, I think that any mouse event is triggering change detection.
  mouseEventHandler(ev: any): void {
    this.geoDataService.mapMouseLocation = ev.latlng;
  }

  tileServerToLayer(tileServer: TileServer) {
    if (tileServer.type == 'tms') {

      return L.tileLayer(tileServer.url, {
        minZoom: tileServer.minZoom,
        maxZoom: tileServer.maxZoom,
        attribution: tileServer.attribution,
      });
    } else if (tileServer.type == 'wms') {
      let mapConfiguration = {
        attribution: tileServer.attribution,
        layers: tileServer.layers,
        opacity: 0.5,
        format: 'image/jpeg'
      };
      mapConfiguration.layers = tileServer.layers;
      return L.tileLayer.wms(tileServer.url, mapConfiguration);
    }
  }

  /**
   * Load Features for a project.
   */
  loadFeatures() {
    const geojsonOptions = {
      pointToLayer: createMarker
    };

    this.geoDataService.tileServers.subscribe((next: Array<TileServer>) => {
      // TODO: refactor
      if (next) {

        // Handle Deletion before new tileserver is set
        if (this.tileServers) {
          this.tileServers.forEach(tileServer => {
            if (!next.some(ts => ts.id == tileServer.id)) {
              this.map.removeLayer(this.layers[tileServer.name]);
            }
          });
        }

        this.tileServers = next;

        next.forEach((ts) => {
          if (!this.layers[ts.name]) {
            this.layers[ts.name] = this.tileServerToLayer(ts);
          }
          this.layers[ts.name].setZIndex(ts.zIndex);
          this.layers[ts.name].setOpacity(ts.opacity);
          if (ts.isActive) {
            this.map.addLayer(this.layers[ts.name]);
          } else {
            this.map.removeLayer(this.layers[ts.name]);
          }
        });
      }
    });

    this.geoDataService.features.subscribe((collection) => {
        this.features.clearLayers();
        this.overlays.clearLayers();
        const markers = L.markerClusterGroup({
          iconCreateFunction: (cluster) => {
            return L.divIcon({html: `<div><b>${cluster.getChildCount()}</b></div>`, className: 'marker-cluster'});
          }
        });
        // markers.setZIndex(this.tileServers.length + 1);

        collection.features.forEach( d => {
          const feat = L.geoJSON(d, geojsonOptions);
          feat.on('click', (ev) => { this.featureClickHandler(ev); } );

          feat.setZIndex(this.tileServers.length + 1);

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
