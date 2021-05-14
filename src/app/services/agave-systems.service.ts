import { Injectable } from '@angular/core';
import {SystemSummary} from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import {Observable, ReplaySubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { DesignSafeProjectCollection } from '../models/models';

@Injectable({
  providedIn: 'root'
})

export class AgaveSystemsService {

  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();
  private _projects: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly projects: Observable<SystemSummary[]> = this._projects.asObservable();
  private _dsProjects: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public readonly dsProjects: Observable<any[]> = this._dsProjects.asObservable();
  constructor(private tapis: ApiService, private envService: EnvService, private http: HttpClient) { }

  list() {
    this.tapis.systemsList({type: 'STORAGE'})
      .subscribe(resp => {
        this._systems.next(resp.result);
      }, error => {
        this._systems.next(null);
      });
    this.http.get<DesignSafeProjectCollection>(this.envService.designSafeUrl + `/projects/v2/`)
      .subscribe( resp => {
        const projectSystems = resp.projects.map((project) => {
          return {
            id: 'project-' + project.uuid,
            name: project.uuid,
            description: project.value.title,
          };
        });
        this._projects.next(projectSystems);
      }, error => {
        this._projects.next(null);
      });
  }

  getDSProjectId() {
    this.http.get<DesignSafeProjectCollection>(this.envService.designSafeUrl + `/projects/v2/`)
      .subscribe( resp => {
        const projectSystems = resp.projects.map((project) => {
          return {
            id: 'project-' + project.uuid,
            dsId: project.value.projectId
          };
        });
        this._dsProjects.next(projectSystems);
      }, error => {
        this._dsProjects.next(null);
      });

  }
}
