import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import { AuthToken, Project } from '../models/models';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {LatLng} from 'leaflet';
import {IProjectUser} from '../models/project-user';
import {FilterService} from './filter.service';
import {FeatureAsset, IFeatureAsset, IFileImportRequest, IPointCloud, Overlay} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {filter, map, take, toArray} from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';
import {NotificationsService} from './notifications.service';
import {StreetviewAuthentication, StreetviewTokens} from '../models/streetview'
import {ProjectsService} from './projects.service';
import {AuthenticatedUser, AuthService} from './authentication.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  private MAPILLARY_TOKEN_KEY: string = "mapillaryToken";
  private GOOGLE_TOKEN_KEY: string = "googleToken";
  userToken: AuthToken;

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private router: Router) { }

  login(sv: string, projectId: number, uname: string, active: boolean) {
    this.getRemoteToken(sv, projectId, uname).subscribe(resp => {
      console.log(resp)
      let authorized = resp.authorized;
      if (authorized) {
        this.setLocalToken(sv, authorized);
      } else {
        if (active) {
          window.location.href = resp.url;
        }
      }
    }, error => {
      this.notificationsService.showErrorToast('Could not log in to ' + sv);
    });
  }

  getLocalToken(sv: string) {
    if (sv == 'google') {
      return localStorage.getItem(this.GOOGLE_TOKEN_KEY);
    } else {
      return localStorage.getItem(this.MAPILLARY_TOKEN_KEY);
    }
  }

  setLocalToken(sv: string, token: any) {
    const userToken = AuthToken.fromExpiresIn(token.access_token, token.expiration_date);
    if (sv == 'google') {
      localStorage.setItem(this.GOOGLE_TOKEN_KEY, JSON.stringify(userToken));
    } else {
      localStorage.setItem(this.MAPILLARY_TOKEN_KEY, JSON.stringify(userToken));
    }
  }

  getRemoteToken(sv: string, projectId: number, uname: string) {
    return this.http.get<any>(environment.apiUrl + `/projects/${projectId}/users/${uname}/streetview/${sv}`);
  }

  deleteRemoteToken(sv: string, projectId: number, uname: string) {
    this.http.delete<any>(environment.apiUrl + `/projects/${projectId}/users/${uname}/streetview/${sv}`)
      .subscribe((resp) => {
        console.log("cool");
      });
  }

  uploadPathToStreetviewService(projectId: number, username: string, dir: RemoteFile, toMapillary: boolean, toGoogle: boolean): void {
    const tmp = {
      system: dir.system,
      path: dir.path
    };

    const payload = {
      folder: tmp,
      mapillary: toMapillary,
      google: toGoogle,
      retry: false
    };

    console.log(payload);

    this.http.post(environment.apiUrl + `/projects/${projectId}/users/${username}/streetview/upload/`, payload)
      .subscribe( (resp) => {
      }, error => {
        // TODO: Add notification / toast
      });
  }

  public logout(service: string, projectId: number, uname: string) {
    if (service == 'google') {
      localStorage.removeItem(this.GOOGLE_TOKEN_KEY);
    } else {
      localStorage.removeItem(this.MAPILLARY_TOKEN_KEY);
    }
    this.deleteRemoteToken(service, projectId, uname)
  }
}
