import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-feature-group',
  templateUrl: './feature-group.component.html',
  styleUrls: ['./feature-group.component.styl']
})
export class FeatureGroupComponent implements OnInit {
  public options: Options;
  constructor() {
    this.options = {
      floor: 0,
      ceil: 100
    };
  }

  ngOnInit() {

  }

}
