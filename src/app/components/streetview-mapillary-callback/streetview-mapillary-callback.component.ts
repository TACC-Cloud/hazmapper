import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, Route} from '@angular/router';
import {StreetviewService} from '../../services/streetview.service';

@Component({
  selector: 'app-streetview-mapillary-callback',
  templateUrl: './streetview-mapillary-callback.component.html',
  styleUrls: ['./streetview-mapillary-callback.component.styl']
})
export class StreetviewMapillaryCallbackComponent implements OnInit {

  constructor(private streetviewService: StreetviewService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.streetviewService.getToken(params, 'mapillary');
    // this.streetviewService.getUserStreetviewTokens('test');

  }
}
