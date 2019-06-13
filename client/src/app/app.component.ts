import {Component} from '@angular/core';
import {SSOService} from "./services/authentication.service";
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './services/oauth2.config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl'],
})
export class AppComponent {
  title = 'viewer';

  constructor(private oauthService: OAuthService) {
      // this.oauthService.configure(authConfig);
      // this.oauthService.setStorage(localStorage);
      // debugger
      // this.oauthService.initImplicitFlow()
    }
}


