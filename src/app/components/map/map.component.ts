import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import * as L  from 'leaflet';
import 'types.leaflet.heat';
import 'leaflet.markercluster';

import { GeoDataService} from "../../services/geo-data.service";
import { createMarker } from "../../utils/leafletUtils";
import {Feature} from "geojson";
import {FeatureGroup, LatLng, LeafletMouseEvent} from "leaflet";
import * as turf from '@turf/turf';
import { AllGeoJSON } from "@turf/helpers";
import {skip} from "rxjs/operators";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.styl']
})
export class MapComponent implements OnInit {
  map: L.Map;
  // projectId: number;
  mapType: string = "normal";
  // cluster: string;
  activeFeature: Feature;
  features : FeatureGroup = new FeatureGroup();

  constructor(private GeoDataService: GeoDataService,
              private route: ActivatedRoute,
              ) {

    // Have to bind these to keep this being this
    this.featureClickHandler.bind(this);
    this.mouseEventHandler.bind(this);
  }

  ngOnInit() {
    const mapType: string = this.route.snapshot.queryParamMap.get('mapType');
    // this.projectId = +this.route.snapshot.paramMap.get("projectId");
    // this.cluster = this.route.snapshot.queryParamMap.get('mapType');

    this.map = new L.Map('map', {
     center: [40, -80],
     zoom: 9
    });

    let baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    this.map.addLayer(baseOSM);
    let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    this.loadFeatures();

    // Publish the mouse location on the mapMouseLocation stream
    this.map.on("mousemove", (ev:LeafletMouseEvent)=>this.mouseEventHandler(ev));

    // Listen on the activeFeature stream and zoom map to that feature when it changes
    this.GeoDataService.activeFeature.pipe(skip(1)).subscribe( (next)=>{
      this.activeFeature = next;
      console.log(next);
      console.log(turf.bbox(<AllGeoJSON>next));
      let bbox = turf.bbox(<AllGeoJSON>next);

      this.map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
    });

    // Listen for changes to the basemap
    this.GeoDataService.basemap.pipe(skip(1)).subscribe((next)=>{
      if (next == 'sat') {
        this.map.removeLayer(baseOSM);
        this.map.addLayer(satellite);
      }
      if (next == 'roads') {
        this.map.removeLayer(satellite);
        this.map.addLayer(baseOSM);
      }
    });
  }


  mouseEventHandler (ev:any) :void{
    this.GeoDataService.mapMouseLocation = ev.latlng;
  }


  /**
   * Load Features for a project.
   */
  loadFeatures () {
    let geojsonOptions = {
      pointToLayer: createMarker
    };
    this.GeoDataService.features.subscribe(collection=> {
      this.features.clearLayers();
      let markers = L.markerClusterGroup({
        iconCreateFunction: (cluster)=>{
          return L.divIcon({html:`<div><b>${cluster.getChildCount()}</b></div>`, className:'marker-cluster'})
        }
      });
      collection.features.forEach( d=>{
        let feat = L.geoJSON(d, geojsonOptions);
        feat.on('click', (ev)=>{ this.featureClickHandler(ev)} );

        if (d.geometry.type == "Point") {
          markers.addLayer(feat);
        } else {
          this.features.addLayer(feat);
        }
      });
      this.features.addLayer(markers);
      this.map.addLayer(this.features);
      try {
        this.map.fitBounds(this.features.getBounds());
      } catch (e) {
        console.log(e);
      }

    });

  }

  /**
   *
   * @param ev
   */
  featureClickHandler(ev: any): void {
    this.GeoDataService.activeFeature = ev.layer.feature;
  }
}
