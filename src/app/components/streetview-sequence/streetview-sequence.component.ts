import { Component, OnInit, Input, Output } from '@angular/core';
import { StreetviewService } from '../../services/streetview.service';

@Component({
  selector: 'app-streetview-sequence',
  templateUrl: './streetview-sequence.component.html',
  styleUrls: ['./streetview-sequence.component.styl']
})
export class StreetviewSequenceComponent implements OnInit {
  @Input() sequence;

  sequenceImages: Array<any> = [];

  constructor(
    private streetviewService: StreetviewService) {
  }

  ngOnInit() {
    this.streetviewService.getMapillaryImages(this.sequence.id);
  }

  focusToImageLocation(img) {
    console.log(img.name);
  }

  deleteSequence(service: string, seqId: number) {
    this.streetviewService.removeStreetviewSequence(service, seqId);
  }

}
