import {Injectable, NgModule} from '@angular/core';
import {Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { NotFoundComponent} from "./components/notfound/notfound.component";
import {AuthenticationService} from "./services/authentication.service";
import {Observable} from "rxjs";
import {MainComponent} from "./components/main/main.component";


@Injectable()
class Activate implements CanActivate {
  constructor(private authSvc: AuthenticationService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
    return this.authSvc.authenticate()
  }
}


const routes: Routes = [
  // {path: 'projects/:projectId', component: MapComponent,  canActivate: [Activate]},
  // {path: 'projects', component: ProjectsComponent, canActivate: [Activate]},
  {path: '', component: MainComponent, canActivate: []},
  {path: '404', component: NotFoundComponent },
  {path: '**', redirectTo: 'projects'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [Activate]
})
export class AppRoutingModule { }


