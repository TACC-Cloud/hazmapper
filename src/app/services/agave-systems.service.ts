import { Injectable } from '@angular/core';
import {SystemSummary} from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import {Observable, ReplaySubject} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import { environment } from '../../environments/environment';
import { DSProjectCollection } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AgaveSystemsService {

  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();
  private _projects: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly projects: Observable<SystemSummary[]> = this._projects.asObservable();
  constructor(private tapis: ApiService, private http: HttpClient) { }

  list() {
    this.tapis.systemsList({type: 'STORAGE'})
      .subscribe(resp => {
        this._systems.next(resp.result);
      }, error => {
        this._systems.next(null);
      });
    this.http.get<DSProjectCollection>(environment.designSafeUrl +`/projects/v2/`)
      .subscribe( resp => {
        let projectSystems = resp.projects.map((project) => {
          return {
            id: "project-" + project.uuid,
            name: project.uuid,
            description: project.value.title,
          }
        });
        this._projects.next(projectSystems);
      }, error => {
        this._projects.next(null);
      });
  }
}
