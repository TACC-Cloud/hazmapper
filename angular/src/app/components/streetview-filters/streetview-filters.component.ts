import {Component, OnInit} from '@angular/core';
import {Streetview, StreetviewOrganization} from '../../models/streetview';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthenticationService} from '../../services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-filters',
  templateUrl: './streetview-filters.component.html',
  styleUrls: ['./streetview-filters.component.styl']
})
export class StreetviewFiltersComponent implements OnInit {
  public activeStreetview: Streetview;
  public organizations = [];

  constructor(private streetviewAuthenticationService: StreetviewAuthenticationService,
              private streetviewService: StreetviewService) {}

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
    });

    this.streetviewService.activeMapillaryOrganizations.subscribe((orgs: any) => {
      this.organizations = orgs;
    });
  }

  addOrRemoveOrganization(id: string) {
    if (this.organizations.includes(id)) {
      this.streetviewService.activeMapillaryOrganizations = this.organizations.filter(org => org !== id);
    } else {
      this.streetviewService.activeMapillaryOrganizations = [...this.organizations, id];
    }
  }

  isActive(so: StreetviewOrganization) {
    return this.organizations.includes(so.key);
  }
}

