import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Feature } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';

@Component({
  selector: 'app-feature-row',
  templateUrl: './feature-row.component.html',
  styleUrls: ['./feature-row.component.styl'],
})
export class FeatureRowComponent implements OnInit {
  @Input() isPublicView = false;
  @Input() feature: Feature;
  @Output() clickRequest = new EventEmitter<Feature>();
  constructor(private geoDataService: GeoDataService) {}

  ngOnInit() {}

  click() {
    this.clickRequest.emit(this.feature);
  }

  delete() {
    this.geoDataService.deleteFeature(this.feature);
  }
}
