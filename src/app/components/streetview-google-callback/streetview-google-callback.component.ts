import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, Route} from '@angular/router';
import {StreetviewService} from '../../services/streetview.service';
@Component({
  selector: 'app-streetview-google-callback',
  templateUrl: './streetview-google-callback.component.html',
  styleUrls: ['./streetview-google-callback.component.styl']
})
export class StreetviewGoogleCallbackComponent implements OnInit {

  constructor(private streetviewService: StreetviewService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.streetviewService.getToken(params, 'google');
  }

}
