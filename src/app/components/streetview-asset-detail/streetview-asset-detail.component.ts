import {Component, OnInit} from '@angular/core';
import {StreetviewService} from '../../services/streetview.service';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {StreetviewAuthenticationService} from '../../services/streetview-authentication.service';
import {ModalStreetviewLinkComponent} from '../modal-streetview-link/modal-streetview-link.component';
import { Streetview } from '../../models/streetview';

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
              public streetviewAssetEvent: any;
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
      if (next) {
        const featureAsset = next.feature;
        const prop = next.layer.feature ? next.layer.feature.properties : next.layer.properties;
        this.activeStreetviewAsset = prop;
        this.streetviewAssetEvent = {
          latlng: next.latlng,
          properties: prop
        };
        if (this.activeStreetviewAsset.image_id) {
          this.assetType = 'Sequence';
          this.imageId = this.activeStreetviewAsset.image_id;
          this.sequenceId = this.activeStreetviewAsset.id;
        } else {
          this.assetType = 'Image';
          this.imageId = this.activeStreetviewAsset.id;
          this.sequenceId = this.activeStreetviewAsset.sequence_id;
        }
        this.siteUrl = 'https://www.mapillary.com/app/?pKey=' + this.imageId;

        this.showLinkModal = this.activeStreetview && !featureAsset
          ? !this.streetviewAuthenticationService.sequenceInStreetview(this.sequenceId)
          : false;

        this.imageLoading = true;

        if (!featureAsset) {
          this.streetviewService.getMapillaryImageData(this.imageId, ['thumb_1024_url']).subscribe(e => {
            this.imageUrl = e.thumb_1024_url;
            this.imageLoading = false;
          });
        } else {
          this.imageUrl = next.path
          this.imageLoading = false;
        }
      }
    });
  }

  openStreetviewLinkModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLinkComponent);
    modal.content.onClose.subscribe((linkData: any) => {
      this.streetviewService.addSequenceToPath(this.activeStreetview.id,
        this.sequenceId,
        linkData.selectedOrganization,
        linkData.selectedPath
        );
    });
  }

  sendEvent(type: string) {
    this.streetviewService.assetDetailEvent = {
      asset: this.streetviewAssetEvent,
      type
    };
  }

  close() {
    this.sendEvent('close');
    this.streetviewService.activeAsset = null;
  }
}
