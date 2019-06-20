import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "../../models/models";

@Component({
  selector: 'app-feature-metadata',
  templateUrl: './feature-metadata.component.html',
  styleUrls: ['./feature-metadata.component.styl']
})
export class FeatureMetadataComponent implements OnInit {

  @Input() feature : Feature;

  constructor() { }

  ngOnInit() {
  }

}
