import { Component, Input, OnInit } from '@angular/core';
import { Feature } from '../../models/models';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.styl'],
})
export class FeatureIconComponent implements OnInit {
  @Input() feature: Feature;

  constructor() {}

  ngOnInit() {}
}
