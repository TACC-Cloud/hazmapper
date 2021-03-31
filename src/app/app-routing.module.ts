import {Injectable, NgModule} from '@angular/core';
import {Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { NotFoundComponent} from './components/notfound/notfound.component';
import {AuthService} from './services/authentication.service';
import {MainComponent} from './components/main/main.component';
import {MainProjectComponent} from './components/main-project/main-project.component';
import {MainWelcomeComponent} from './components/main-welcome/main-welcome.component';
import { CallbackComponent } from './components/callback/callback.component';

@Injectable()
export class Activate implements CanActivate {
  constructor(private authSvc: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
     if (this.authSvc.isLoggedIn()) {
       return true;
     }
     this.authSvc.login();
  }
}


const routes: Routes = [
  {path: '', component: MainComponent, children: [
    {path: '', component: MainWelcomeComponent, canActivate: [Activate]},
    {path: 'project/:projectUUID', component: MainProjectComponent, canActivate: [Activate]},
    {path: 'project-public/:projectUUID', component: MainProjectComponent}
    ]},

  {path: 'callback', component: CallbackComponent},
  {path: '404', component: NotFoundComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [Activate]
})
export class AppRoutingModule { }
