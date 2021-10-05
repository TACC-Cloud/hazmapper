import {Component, OnInit} from '@angular/core';
import {Streetview} from '../../models/streetview';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthenticationService} from '../../services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-filters',
  templateUrl: './streetview-filters.component.html',
  styleUrls: ['./streetview-filters.component.styl']
})
export class StreetviewFiltersComponent implements OnInit {
  private activeStreetview: Streetview;

  constructor(private streetviewAuthenticationService: StreetviewAuthenticationService) {}

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
    });
  }
}

