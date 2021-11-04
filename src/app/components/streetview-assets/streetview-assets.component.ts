import { Component, OnInit } from '@angular/core';
import {BsModalService} from 'ngx-foundation';
import {ModalStreetviewInfoComponent} from '../modal-streetview-info/modal-streetview-info.component';
import {Streetview, StreetviewInstance} from '../../models/streetview';
import {StreetviewAuthenticationService} from 'src/app/services/streetview-authentication.service';


@Component({
  selector: 'app-streetview-assets',
  templateUrl: './streetview-assets.component.html',
  styleUrls: ['./streetview-assets.component.styl']
})
export class StreetviewAssetsComponent implements OnInit {
  public activeStreetview: Streetview;

  constructor(private streetviewAuthService: StreetviewAuthenticationService,
              private bsModalService: BsModalService) { }

  ngOnInit() {
    this.streetviewAuthService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
    });
  }

  openStreetviewInstanceInfoModal(streetviewInstanceId: number) {
    const initialState = {
      streetviewInstanceId
    };
    this.bsModalService.show(ModalStreetviewInfoComponent, { initialState });
  }
}
