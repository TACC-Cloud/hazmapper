import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "../../models/models";

@Component({
  selector: 'app-feature-row',
  templateUrl: './feature-row.component.html',
  styleUrls: ['./feature-row.component.styl']
})
export class FeatureRowComponent implements OnInit {

  @Input() feature : Feature;
  constructor() { }

  ngOnInit() {
  }

}
