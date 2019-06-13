import {Injectable, NgModule} from '@angular/core';
import {Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { NotFoundComponent} from "./components/notfound/notfound.component";
import {SSOService} from "./services/authentication.service";
import {Observable} from "rxjs";
import {MainComponent} from "./components/main/main.component";


@Injectable()
class Activate implements CanActivate {
  constructor(private authSvc: SSOService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
    return this.authSvc.isLoggedIn()
  }
}


const routes: Routes = [
  // {path: 'projects/:projectId', component: MapComponent,  canActivate: [Activate]},
  // {path: 'projects', component: ProjectsComponent, canActivate: [Activate]},
  {path: '', component: MainComponent, canActivate: [Activate]},
  { path: 'callback', component: MainComponent},
  {path: '404', component: NotFoundComponent },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [Activate]
})
export class AppRoutingModule { }


