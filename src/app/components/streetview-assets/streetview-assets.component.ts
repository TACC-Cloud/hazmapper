import { Component, OnInit } from '@angular/core';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-streetview-assets',
  templateUrl: './streetview-assets.component.html',
  styleUrls: ['./streetview-assets.component.styl']
})
export class StreetviewAssetsComponent implements OnInit {
  private mapillarySequences: Array<any> = [];

  constructor(private streetviewService: StreetviewService) { }

  ngOnInit() {
    this.streetviewService.getStreetviewSequences('mapillary');

    this.streetviewService.streetviewSequences.subscribe((next) => {
      this.mapillarySequences = next;
    })
  }

  toggleStreetview(svId: number) {
    let sv = this.mapillarySequences[svId];
    sv.open = !sv.open;
  }

  toggleSequence(seqId: number, sequences: Array<any>) {
    let seq = sequences[seqId];
    seq.open = !seq.open;
  }

  deleteSequence(service: string, seqId: number) {
    this.streetviewService.removeStreetviewSequence(service, seqId);
  }

}
