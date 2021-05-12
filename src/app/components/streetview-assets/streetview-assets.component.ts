import { Component, OnInit } from '@angular/core';
import { StreetviewService } from 'src/app/services/streetview.service';
import { BsModalService } from 'ngx-foundation';
import { ModalStreetviewInfoComponent } from '../modal-streetview-info/modal-streetview-info.component';

@Component({
  selector: 'app-streetview-assets',
  templateUrl: './streetview-assets.component.html',
  styleUrls: ['./streetview-assets.component.styl']
})
export class StreetviewAssetsComponent implements OnInit {
  private streetviews: Array<any> = [];

  constructor(private streetviewService: StreetviewService,
              private bsModalService: BsModalService) { }

  ngOnInit() {
    this.streetviewService.getStreetviews();

    this.streetviewService.streetviews.subscribe((next) => {
      this.streetviews = next;
    })
  }

  openStreetviewInfoModal(streetview: any) {
    const initialState = {
      streetview
    };
    this.bsModalService.show(ModalStreetviewInfoComponent, { initialState });
  }
}
