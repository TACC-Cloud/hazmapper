import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from 'geojson';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature} from '../../models/models';

@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl']
})
export class AssetsPanelComponent implements OnInit {
  features: FeatureCollection;
  activeFeature: Feature;
  displayFeatures: Array<Feature>;
  count = 200;
  scrollStep = 200;

  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.GeoDataService.features.subscribe( (fc: FeatureCollection) => {
      this.features = fc;
      this.displayFeatures = this.features.features.slice(0, this.count);
    });
    this.GeoDataService.activeFeature.subscribe( (next) => {
      this.activeFeature = next;
    });

  }

  // TODO: Implement onScrollUp and scrolling to the right feature when a marker is clicked on the map

  onScroll() {
    console.log(this.displayFeatures.length);

    this.displayFeatures.push(...this.features.features.slice(this.count, this.count + this.scrollStep));
    this.count += this.scrollStep;
  }

  trackByFn(index: number, feat: Feature): number {
    return <number> feat.id;
  }

  selectFeature(feat) {
    this.GeoDataService.activeFeature = feat;
  }

}
