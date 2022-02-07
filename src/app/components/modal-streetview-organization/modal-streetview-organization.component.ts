import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {StreetviewAuthenticationService} from 'src/app/services/streetview-authentication.service';
import { StreetviewService } from 'src/app/services/streetview.service';
import { BsModalRef } from 'ngx-foundation/modal';
import { Streetview } from '../../models/streetview';

@Component({
  selector: 'app-modal-streetview-organization',
  templateUrl: './modal-streetview-organization.component.html',
  styleUrls: ['./modal-streetview-organization.component.styl']
})
export class ModalStreetviewOrganizationComponent implements OnInit {
  public onClose: Subject<any> = new Subject<any>();
  public key = '';
  public activeStreetview: Streetview;

  constructor(
    public bsModalRef: BsModalRef,
    private streetviewAuthenticationService: StreetviewAuthenticationService,
    private streetviewService: StreetviewService
  ) {}

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
    });
  }

  cancel() {
    this.bsModalRef.hide();
  }

  addOrganization() {
    if (this.key !== '') {
      this.streetviewService.addOrganization(this.activeStreetview.id,
        this.key
      );
    }
  }

  removeOrganization(organization: any) {
    this.streetviewService.removeOrganization(organization.id);
  }

  submit() {
    this.onClose.next({
      key: this.key
    });
    this.bsModalRef.hide();
  }

}
