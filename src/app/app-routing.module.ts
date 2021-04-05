import {Injectable, NgModule} from '@angular/core';
import {Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {NotFoundComponent} from './components/notfound/notfound.component';
import {AuthService} from './services/authentication.service';
import {MainComponent} from './components/main/main.component';
import {MainProjectComponent} from './components/main-project/main-project.component';
import {MainWelcomeComponent} from './components/main-welcome/main-welcome.component';
import {CallbackComponent} from './components/callback/callback.component';
import {LoginComponent} from './components/login/login.component';
import {LogoutComponent} from './components/logout/logout.component';
import {LOGIN} from './constants/routes';


@Injectable()
export class Activate implements CanActivate {
  constructor(private authSvc: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
     if (this.authSvc.isLoggedIn()) {
       return true;
     }
     this.router.navigateByUrl(LOGIN + '?to=' + encodeURIComponent(state.url));
     return false;
  }
}

// todo check project listings
const routes: Routes = [
  {path: '', component: MainComponent, children: [
      {path: 'login', component: LoginComponent},
      {path: 'logout', component: LogoutComponent},
      {path: 'project-public/:projectUUID', component: MainProjectComponent},
      {path: 'project/:projectUUID', component: MainProjectComponent, canActivate: [Activate]},
      {path: '', pathMatch: 'full', component: MainWelcomeComponent, canActivate: [Activate]},
    ]},
  {path: 'callback', component: CallbackComponent},
  {path: '404', component: NotFoundComponent},
  {path: '**', redirectTo: '', pathMatch: 'full'}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
  providers: [Activate]
})
export class AppRoutingModule { }
