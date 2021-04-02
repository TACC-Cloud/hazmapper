import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { Project } from '../../models/models';
import { AuthenticatedUser, AuthService } from '../../services/authentication.service';
import { StreetviewService } from '../../services/streetview.service';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ProjectsService} from '../../services/projects.service'
import { ModalStreetviewPublishComponent } from '../modal-streetview-publish/modal-streetview-publish.component';
import { ModalStreetviewLinkComponent } from '../modal-streetview-link/modal-streetview-link.component';


@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit {

  private activeProject: Project;
  private currentUser: AuthenticatedUser;

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
              private projectsService: ProjectsService,
              private authService: AuthService
             ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe( (next) => {
      this.currentUser = next;
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    modal.content.onClose.subscribe( (publishData: any) => {
      this.streetviewService.uploadPathToStreetviewService(publishData.selectedPath,
                                                           publishData.publishToMapillary,
                                                           publishData.publishToGoogle);
    });
  }

  openStreetviewLinkModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLinkComponent);
    modal.content.onClose.subscribe( (linkData: any) => {
      this.streetviewService.addSequenceToPath(linkData.service,
                                               linkData.sequences,
                                               linkData.selectedPath);
    });
  }

  login(svService: string) {
    this.streetviewAuthenticationService.login(svService);
  }

  logout(svService: string) {
    this.streetviewAuthenticationService.logout(svService);
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }
}
