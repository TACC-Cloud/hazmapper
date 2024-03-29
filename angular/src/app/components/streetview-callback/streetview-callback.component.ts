import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-foundation';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ModalStreetviewUsernameComponent } from '../modal-streetview-username/modal-streetview-username.component';
import { Streetview } from '../../models/streetview';
import { ModalStreetviewOrganizationComponent } from '../modal-streetview-organization/modal-streetview-organization.component';

@Component({
  selector: 'app-streetview-callback',
  templateUrl: './streetview-callback.component.html',
  styleUrls: ['./streetview-callback.component.styl'],
})
export class StreetviewCallbackComponent implements OnInit {
  constructor(
    private streetviewAuthenticationService: StreetviewAuthenticationService,
    private route: ActivatedRoute,
    private bsModalService: BsModalService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  activeStreetview: Streetview;

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe((next: Streetview) => {
      this.activeStreetview = next;
    });

    const params = this.route.snapshot.queryParams;
    const state = JSON.parse(params.state);

    const service = state.service;
    const originUrl = state.originUrl;
    const isPublicView = state.isPublicView;

    this.streetviewAuthenticationService.setToken(service, params.code).subscribe((resp: any) => {
      const token = {
        token: resp.access_token,
        expires_in: resp.expires_in,
      };

      this.streetviewAuthenticationService.setLocalToken(service, token);

      if (!isPublicView) {
        this.streetviewAuthenticationService.getStreetviews().subscribe((svs) => {
          const currentStreetview = svs.some((sv) => sv.service === service);
          if (!currentStreetview) {
            this.streetviewAuthenticationService
              .createStreetview({
                token: token.token,
                service,
              })
              .subscribe(() => {
                const usernameModal = this.bsModalService.show(ModalStreetviewUsernameComponent, { class: 'tiny' });
                usernameModal.content.onClose.subscribe((user: any) => {
                  if (resp.username && this.activeStreetview) {
                    this.streetviewAuthenticationService.updateStreetviewByService(service, { service_user: user.username });
                    this.notificationsService.showSuccessToast('Successfully added username to Mapillary!');
                    this.bsModalService.show(ModalStreetviewOrganizationComponent);
                  } else {
                    this.notificationsService.showWarningToast('Must include username to Mapillary to work properly!');
                  }
                });
              });
          } else {
            const data = {
              token: token.token,
            };
            this.streetviewAuthenticationService.updateStreetviewByService(service, data);
          }
        });
      }
    });

    this.router.navigate([originUrl]);
  }
}
