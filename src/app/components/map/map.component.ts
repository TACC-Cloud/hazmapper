import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';

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
import 'leaflet-contextmenu';
import { assetStyles } from 'src/app/constants/styles';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit, OnDestroy {
  map: L.Map;
  activeFeature: Feature;
  _activeProjectId: number;
  nonPointFeatures: LayerGroup[] = [];
  features: FeatureGroup = new FeatureGroup();
  featuresList: any;
  overlays: LayerGroup = new LayerGroup<any>();
  tileServerLayers: Map<number, TileLayer> = new Map<number, TileLayer>();
  fitToFeatureExtent = true;
  private subscription: Subscription = new Subscription();

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private envService: EnvService,
             ) {
    // Have to bind these to keep this being this
    this.featureClickHandler.bind(this);
    this.mouseEventHandler.bind(this);
  }

  ngOnInit() {
    this.map = new L.Map('map', {
      center: [40, -80],
      zoom: 3,
      maxZoom: 19,
    	contextmenu: true,
      contextmenuWidth: 140,
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

    // Subscribe to active project and features
    this.subscription.add(this.loadFeatures());

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

      this.geoDataService.features = {
        ...this.featuresList,
        features: this.featuresList.features.map((f: Feature) => {
          f.properties.style = f.id === next.id ? assetStyles.active : null;
          return f
        })
      };
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    } else if (ts.type === 'arcgis') {
      return esri.tiledMapLayer({
        url: ts.url
      });
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
      this.featuresList = collection;
      this.features.clearLayers();
      this.overlays.clearLayers();
      this.nonPointFeatures = [];
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


        if (d.geometry.type === 'Point') {
          feat.setZIndex(2);
          markers.addLayer(feat);
        } else {
          feat.setZIndex(1);
          this.nonPointFeatures.push(feat);
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
      this._activeProjectId = next ? next.id : null;
    }));

    return subscription;
  }

  /**
   *
   * @param ev
   */
  featureClickHandler(ev: any): void {
    if (ev.layer.feature.featureType() === 'point_cloud') {
      const overlapFeatures = [];
      this.map.contextmenu.removeAllItems();

      this.nonPointFeatures.forEach((of: LayerGroup) => {
        const ofLayer: any = of.getLayers()[0];
        const ofBounds: L.LatLngBounds = ofLayer.getBounds();
        const layerExists = ofBounds.contains(ev.latlng);
        if (layerExists) {
          overlapFeatures.push(ofLayer.feature);
          this.map.contextmenu.addItem({
            text: ofLayer.feature.id,
            callback: (ev) => {
              const f = ofLayer.feature;
              this.geoDataService.activeFeature = f;
            }
          });
        }
      });

      if (overlapFeatures.length > 1) {
        this.map.contextmenu.showAt(ev.latlng);
      } else {
        const f = ev.layer.feature;
        this.geoDataService.activeFeature = f;
      }

    } else {
      const f = ev.layer.feature;
      this.geoDataService.activeFeature = f;
    }
  }
}
