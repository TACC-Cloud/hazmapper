import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';

import { ProjectsService} from '../../services/projects.service';
import { GeoDataService} from '../../services/geo-data.service';
import { createMarker } from '../../utils/leafletUtils';
import {Feature} from 'geojson';
import {FeatureGroup, Layer, LayerGroup, LeafletMouseEvent} from 'leaflet';
import * as turf from '@turf/turf';
import { AllGeoJSON } from '@turf/helpers';
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
  activeFeature: Feature;
  _activeProjectId: number;
  features: FeatureGroup = new FeatureGroup();
  overlays: LayerGroup = new LayerGroup<any>();
  tileServers: Array<TileServer> = new Array<TileServer>();
  tileServerLayers: any = {};
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

    this.geoDataService.tileServers.subscribe((next: Array<TileServer>) => {
      if (next) {
        this.tileServers = next;

        next.forEach((ts) => {
          if (!this.tileServerLayers[ts.id]) {
            this.tileServerLayers[ts.id] = this.tileServerToLayer(ts);
          }

          this.tileServerLayers[ts.id].setZIndex(ts.uiOptions.zIndex);
          this.tileServerLayers[ts.id].setOpacity(ts.uiOptions.opacity);

          if (ts.uiOptions.isActive) {
            this.map.addLayer(this.tileServerLayers[ts.id]);
          } else {
            this.map.removeLayer(this.tileServerLayers[ts.id]);
          }
        });
      }
    });

    this.geoDataService.selectedTileServer.subscribe((ts: TileServer) => {
      if (ts) {
        this.map.removeLayer(this.tileServerLayers[ts.id]);
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
  }

  createOverlayLayer(ov: Overlay): Layer {
    return L.imageOverlay(environment.apiUrl + '/assets/' + ov.path, [[ov.minLat, ov.minLon], [ov.maxLat, ov.maxLon]]);
  }

  // TODO: Might have to use NgZone with this, I think that any mouse event is triggering change detection.
  mouseEventHandler(ev: any): void {
    this.geoDataService.mapMouseLocation = ev.latlng;
  }

  tileServerToLayer(ts: TileServer) {
    let layerOptions = {
      attribution: ts.attribution,
      ...ts.tileOptions
    }

    if (ts.type == 'tms') {
      return L.tileLayer(ts.url, layerOptions);
    } else if (ts.type == 'wms') {
      return L.tileLayer.wms(ts.url, layerOptions);
    }
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
