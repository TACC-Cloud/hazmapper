import {Component, OnInit} from '@angular/core';
import {StreetviewService} from '../../services/streetview.service';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {StreetviewAuthenticationService} from '../../services/streetview-authentication.service';
import {ModalStreetviewLinkComponent} from '../modal-streetview-link/modal-streetview-link.component';
import {
  Streetview,
  StreetviewSequence,
  StreetviewInstance,
} from '../../models/streetview';

@Component({
  selector: 'app-streetview-asset-detail',
  templateUrl: './streetview-asset-detail.component.html',
  styleUrls: ['./streetview-asset-detail.component.styl']
})
export class StreetviewAssetDetailComponent implements OnInit {

  constructor(private streetviewService: StreetviewService,
              private bsModalService: BsModalService,
              private streetviewAuthenticationService: StreetviewAuthenticationService) {}
  public activeStreetviewAsset: any;
  public imageUrl: string;
  public assetType: string;
  public imageId: string;
  public sequenceId: string;
  public siteUrl: string;
  public imageLoading = false;
  public showLinkModal = true;
  public activeStreetview: Streetview;

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe(next => {
      this.activeStreetview = next;
    });

    this.streetviewService.activeAsset.subscribe(next => {
      this.activeStreetviewAsset = next;
      if (next) {
        if (next.image_id) {
          this.assetType = 'Sequence';
          this.imageId = next.image_id;
          this.sequenceId = next.id;
        } else {
          this.assetType = 'Image';
          this.imageId = next.id;
          this.sequenceId = next.sequence_id;
        }

        this.showLinkModal = this.activeStreetview ?
          !this.streetviewAuthenticationService.sequenceInStreetview(this.sequenceId) :
          false;

        this.imageLoading = true;
        this.streetviewService.getMapillaryImageData(this.imageId, ['thumb_1024_url']).subscribe(e => {
          this.imageUrl = e.thumb_1024_url;
          this.imageLoading = false;
          this.siteUrl = 'https://www.mapillary.com/map/im/' + this.imageId;
        });
      }
    });
  }

  openStreetviewLinkModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLinkComponent);
    modal.content.onClose.subscribe((selectedFile: any) => {
      this.streetviewService.addSequenceToPath(this.activeStreetview.id,
                                               this.sequenceId,
                                               selectedFile);
    });
  }

  close() {
    this.streetviewService.activeAsset = null;
  }

}
