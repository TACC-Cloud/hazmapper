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

  // TODO wait for sequence to actually populate (go through mapillary)
  // Mapillary takes time to actually accept the images (sequences) as accepted
  // Show status of that

  constructor(private streetviewService: StreetviewService) {
  }

  ngOnInit() {
    this.sequenceImages = this.sequence.images;
    // Need Spinner here
    // this.streetviewService.sequenceImages.subscribe(i => {
    //   this.sequenceImages = i;
    // });
  }

  focusToImageLocation(img) {
    console.log(img.name);
  }
}
