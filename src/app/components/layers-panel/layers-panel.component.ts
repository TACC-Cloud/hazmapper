import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Overlay} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateOverlayComponent} from '../modal-create-overlay/modal-create-overlay.component';

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {

  basemap: string;
  overlays: Array<Overlay>;
  environment: AppEnvironment;

  constructor(private geoDataService: GeoDataService, private bsModalService: BsModalService) {

  }

  ngOnInit() {
    this.environment = environment;
    this.geoDataService.overlays.subscribe((ovs) => {
      this.overlays = ovs;
    });
    this.geoDataService.basemap.subscribe( (next) => {
      this.basemap = next;
    });
  }

  selectBasemap(bmap: string): void {
    this.basemap = bmap;
    this.geoDataService.basemap = this.basemap;
  }

  selectOverlay(ov): void {
    this.geoDataService.activeOverlay = ov;
  }

  openCreateOverlayModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateOverlayComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
    });
  }



}
