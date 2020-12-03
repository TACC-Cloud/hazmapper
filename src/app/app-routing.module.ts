import {Injectable, NgModule} from '@angular/core';
import {Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { NotFoundComponent} from './components/notfound/notfound.component';
import {AuthService} from './services/authentication.service';
import {MainComponent} from './components/main/main.component';
import {MainPublicComponent} from './components/main-public/main-public.component';
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
  {path: 'maps', component: MainComponent, canActivate: [Activate]},
  {path: 'maps-public/:id', component: MainPublicComponent},
  {path: 'callback', component: CallbackComponent},
  {path: '404', component: NotFoundComponent },
  {path: '', redirectTo: '/maps', pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [Activate]
})
export class AppRoutingModule { }


