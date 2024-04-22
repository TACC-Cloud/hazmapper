import { Injectable } from '@angular/core';
import { SystemSummary } from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import { NotificationsService } from './notifications.service';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { Project } from '../models/models';
import { DesignSafeProjectCollection } from '../models/models';

export interface AgaveProjectsData {
  projects: SystemSummary[];
  failedMessage: string | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AgaveSystemsService {
  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();

  private _projects: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly projects: Observable<SystemSummary[]> = this._projects.asObservable();
  private _loadingProjects: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingProjects: Observable<boolean> = this._loadingProjects.asObservable();
  private _loadingProjectsFailedMessage: BehaviorSubject<string> = new BehaviorSubject('');
  public loadingProjectsFailedMessage: Observable<string> = this._loadingProjectsFailedMessage.asObservable();
  public readonly projectsData: Observable<AgaveProjectsData>;

  constructor(
    private tapisV2: ApiService,
    private notificationsService: NotificationsService,
    private envService: EnvService,
    private http: HttpClient
  ) {
    this.projectsData = combineLatest([this.projects, this.loadingProjectsFailedMessage, this.loadingProjects]).pipe(
      map(([projects, failedMessage, loading]) => ({
        projects,
        failedMessage,
        loading,
      }))
    );
  }

  list() {
    this.http.get<any>(this.envService.tapisUrl + `v3/systems/?listType=ALL`).subscribe(
      (resp) => {
        this._systems.next(resp.result);
      },
      (error) => {
        this._systems.next(null);
      }
    );

    this._projects.next(null);
    this._loadingProjects.next(true);
    this._loadingProjectsFailedMessage.next(null);

    this._projects.next([]);
    this._loadingProjects.next(false);

    this.http.get<DesignSafeProjectCollection>(this.envService.designSafeUrl + `/api/projects/v2/`).subscribe(
      (resp) => {
        const projectSystems = resp.projects.map((project) => {
          return {
            id: 'project-' + project.uuid,
            name: project.value.projectId,
            description: project.value.title,
          };
        });
        this._projects.next(projectSystems);
        this._loadingProjects.next(false);
      },
      (error) => {
        this._projects.next(null);
        this._loadingProjectsFailedMessage.next(error.message || 'An error occured.');
        this._loadingProjects.next(false);
      }
    );
  }

  getProjectMetadata(projects: Project[], dsProjects: SystemSummary[]): Project[] {
    if (dsProjects && dsProjects.length > 0) {
      return projects.map((p) => {
        const dsProject = dsProjects.find((dp) => dp.id === p.system_id);
        p.title = dsProject ? dsProject.description : null;
        p.ds_id = dsProject ? dsProject.name : null;
        return p;
      });
    }
    return projects;
  }
}
