import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {StreetviewAuthenticationService} from 'src/app/services/streetview-authentication.service';
import { StreetviewService } from 'src/app/services/streetview.service';
import { BsModalRef } from 'ngx-foundation/modal';

@Component({
  selector: 'app-modal-streetview-organization',
  templateUrl: './modal-streetview-organization.component.html',
  styleUrls: ['./modal-streetview-organization.component.styl']
})
export class ModalStreetviewOrganizationComponent implements OnInit {
  public onClose: Subject<any> = new Subject<any>();
  public name = '';
  public key = '';
  public showInput = false;
  public organizations: any;
  public activeStreetview: any;

  constructor(
    public bsModalRef: BsModalRef,
    private streetviewAuthenticationService: StreetviewAuthenticationService,
    private streetviewService: StreetviewService
  ) {}

  ngOnInit() {
    this.streetviewAuthenticationService.organizations.subscribe(o => {
      this.organizations = o;
    });

    this.streetviewAuthenticationService.activeStreetview.subscribe(sv => {
      this.activeStreetview = sv;
    });
  }

  cancel() {
    this.bsModalRef.hide();
  }

  addOrganization() {
    if (this.name !== '' && this.key !== '') {
      this.streetviewService.addOrganization(this.activeStreetview.id,
        this.name,
        this.key
      );
    }
  }

  toggleShowInput() {
    this.showInput = !this.showInput;
  }

  removeOrganization(organization: any) {
    this.streetviewService.removeOrganization(organization.id);
  }

  submit() {
    this.onClose.next({
      name: this.name,
      key: this.key
    });
    this.bsModalRef.hide();
  }

}
