import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {Project} from '../models/models';
import { RapidProjectRequest } from '../models/rapid-project-request';
import {catchError, map, tap, filter, take} from 'rxjs/operators';
import {IProjectUser} from '../models/project-user';
import {NotificationsService} from './notifications.service';
import {GeoDataService} from './geo-data.service';
import { EnvService } from '../services/env.service';
import { AuthService } from '../services/authentication.service';
import {defaultTileServers} from '../constants/tile-servers';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private _projects: BehaviorSubject<Project[]> = new BehaviorSubject([]);
  public readonly projects: Observable<Project[]> = this._projects.asObservable();
  private _activeProject: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);
  public readonly activeProject: Observable<Project> = this._activeProject.asObservable();
  private _projectUsers: ReplaySubject<Array<IProjectUser>> = new ReplaySubject<Array<IProjectUser>>(1);
  public readonly projectUsers$: Observable<Array<IProjectUser>> = this._projectUsers.asObservable();

  private _loadingProjects: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingProjects: Observable<boolean> = this._loadingProjects.asObservable();

  private _loadingProjectsFailed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingProjectsFailed: Observable<boolean> = this._loadingProjectsFailed.asObservable();

  private _loadingActiveProject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingActiveProject: Observable<boolean> = this._loadingActiveProject.asObservable();

  private _loadingActiveProjectFailed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingActiveProjectFailed: Observable<boolean> = this._loadingActiveProjectFailed.asObservable();

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private geoDataService: GeoDataService,
              private authService: AuthService,
              private envService: EnvService) { }

  getProjects(): void {
    this._loadingProjects.next(true);
    this._loadingProjectsFailed.next(false);
    this.http.get<Project[]>(this.envService.apiUrl + `/projects/`).subscribe( resp => {
      this._projects.next(resp);
      this._loadingProjects.next(false);
      this._loadingProjectsFailed.next(false);
    }, error => {
      this._loadingProjects.next(false);
      this._loadingProjectsFailed.next(true);
      this.notificationsService.showErrorToast('Failed to retrieve project data! Geoapi might be down.');
    });
  }

  getProjectUsers(proj: Project): void {
    this.http.get<Array<IProjectUser>>(this.envService.apiUrl + `/projects/${proj.id}/users/`)
      .subscribe( (resp) => {
        this._projectUsers.next(resp);
      });
  }

  addUserToProject(proj: Project, uname: string): void {
    const payload = {
      username: uname
    };
    this.http.post(this.envService.apiUrl + `/projects/${proj.id}/users/`, payload)
      .subscribe( (resp) => {
        this.getProjectUsers(proj);
      });
  }

  deleteUserFromProject(proj: Project, uname: string): void {
    this.http.delete(this.envService.apiUrl + `/projects/${proj.id}/users/${uname}/`)
      .subscribe( (resp) => {
        this.getProjectUsers(proj);
      }, error => {
      this.notificationsService.showErrorToast('Unable to delete user');
    });
  }

  create(data: Project): Observable<Project> {
    return this.http.post<Project>(this.envService.apiUrl + `/projects/`, data)
      .pipe(
        tap(proj => {
          // Spread operator, just pushes the new project into the array
          this._projects.next([...this._projects.value, proj]);
          // Add default servers
          defaultTileServers.forEach(ts => {
            this.geoDataService.addTileServer(proj.id, ts, true);
          });

        }),
      );
  }

  exportProject(projectId: number, system_id: string, path: string) {
    const payload = {
      path,
      system_id
    };
    this.http.put<any>(this.envService.apiUrl + `/projects/${projectId}/export/`, payload).subscribe(current_project => {
      this.notificationsService.showSuccessToast(`Create file ${system_id}/${path}/${current_project.uuid}.hazmapper`)
      this._projects.next([...this._projects.value.filter((p) => p.id != projectId),
                           current_project]);
    }, error => {
      console.log(error);
    });
  }

  linkExportProject(proj: Project, system_id: string, path: string = '/') {
    const data = {
      system_id,
      path
    };

    this.http.put<Project>(this.envService.apiUrl + `/projects/${proj.id}/link/`, data).subscribe(
      resp => {
        this.notificationsService.showSuccessToast(`Create file ${system_id}/${path}/${resp.uuid}.hazmapper`)
        this._projects.next([...this._projects.value.filter((p) => p.id != proj.id),
                             resp]);
      }, error => {
        console.log(error);
      });
  }

  createRapidProject(data: RapidProjectRequest) {
    return this.http.post<Project>(this.envService.apiUrl + `/projects/rapid/`, data)
      .pipe(
        map( (proj) => {
          this._projects.next([proj, ...this._projects.value]);
          return proj;
        }),
       catchError( (err: any) =>  {
          if (err instanceof HttpErrorResponse && err.status === 409) {
            throw new Error('This project/folder is already a map project.');
          }
          throw new Error('Unable to create project.');
        })
      );
  }

  setActiveProjectUUID(uuid: string): void {
    this._loadingActiveProject.next(true);
    this._loadingActiveProjectFailed.next(false);
    this.setActiveProject(null);

    this.http.get<Project[]>(this.envService.apiUrl + `/projects/?uuid=` + uuid)
      .subscribe( (resp) => {
        this._loadingActiveProject.next(false);
        this.setActiveProject(resp[0]);
        }, error => {
        this._loadingActiveProject.next(false);
        this._loadingActiveProjectFailed.next(true);
        }
      );
  }

  setActiveProject(proj: Project): void {
    // TODO needs to be extended with a parameter (checkIfHasPrivateAccess)
    //  to check if we need to set _loadingActiveProjectFailed to False
    //  in cases where we have a private view but despite the map being public, the user
    //  is not a member of the project.  https://jira.tacc.utexas.edu/browse/DES-1927

    this._activeProject.next(proj);
    if (proj && this.authService.isLoggedIn()) {
      this.getProjectUsers(proj);
    }
  }

  deleteProject(proj: Project): void {
    this.http.delete(this.envService.apiUrl + `/projects/${proj.id}/`)
      .subscribe( (resp) => {
        this.getProjects();
      }, error => {
        this.notificationsService.showErrorToast('Could not delete project!');
      });
  }

  updateProject(proj: Project, name: string, description: string, isPublic: boolean): void {
    name = name ? name : proj.name;
    description = description ? description : proj.description;
    isPublic = isPublic !== undefined ? isPublic : proj.public;

    const payload = {
      name,
      description,
      public: isPublic
    };

    this.http.put(this.envService.apiUrl + `/projects/${proj.id}/`, payload)
      .subscribe( (resp) => {
        proj.name = name;
      });
  }

  updateActiveProject(name: string, description: string, isPublic: boolean) {
    name = name ? name : this._activeProject.value.name;
    description = description ? description : this._activeProject.value.description;
    isPublic = isPublic !== undefined ? isPublic : this._activeProject.value.public;

    const payload = {
      name,
      description,
      public: isPublic
    };

    return this.http.put<Project>(this.envService.apiUrl + `/projects/${this._activeProject.value.id}/`, payload)
      .pipe(
        map((updatedProject) => {
          // Update the project list
          const projects = this._projects.value.map(proj => proj.id === this._activeProject.value.id ? updatedProject : proj);
          this._projects.next(projects);
          // Update the active project
          this._activeProject.next(updatedProject);
          return updatedProject;
        }),
        catchError((err: any) => {
          throw new Error('Unable to update project.');
        })
      );
  }

}
