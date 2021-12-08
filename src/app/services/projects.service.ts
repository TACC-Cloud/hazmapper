import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {DesignSafeProjectCollection, Project, AgaveFileOperations} from '../models/models';
import { RapidProjectRequest } from '../models/rapid-project-request';
import {catchError, map, tap, filter, take} from 'rxjs/operators';
import {IProjectUser} from '../models/project-user';
import {NotificationsService} from './notifications.service';
import {GeoDataService} from './geo-data.service';
import { EnvService } from '../services/env.service';
import { AuthService } from '../services/authentication.service';
import {MAIN, LOGIN} from '../constants/routes';
import {defaultTileServers} from '../constants/tile-servers';
import { AgaveSystemsService } from '../services/agave-systems.service';
import { Router } from '@angular/router';

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

  private _loadingProjectsFailed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingProjectsFailed: Observable<boolean> = this._loadingProjectsFailed.asObservable();

  private _loadingActiveProject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingActiveProject: Observable<boolean> = this._loadingActiveProject.asObservable();

  private _loadingActiveProjectFailed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingActiveProjectFailed: Observable<boolean> = this._loadingActiveProjectFailed.asObservable();

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private geoDataService: GeoDataService,
              private agaveSystemsService: AgaveSystemsService,
              private router: Router,
              private authService: AuthService,
              private envService: EnvService) { }

  getProjects(): void {
    this._loadingProjectsFailed.next(false);
    this.http.get<Project[]>(this.envService.apiUrl + `/projects/`).subscribe( resp => {
      this._projects.next(resp);
      this._loadingProjectsFailed.next(false);
    }, error => {
      this._loadingProjectsFailed.next(true);
      this.notificationsService.showErrorToast('Failed to retrieve project data! Geoapi might be down.');
    });
  }

  getProjectUsers(proj: Project): Observable<Array<IProjectUser>> {
    return this.http.get<Array<IProjectUser>>(this.envService.apiUrl + `/projects/${proj.id}/users/`).pipe(
      tap(users => {
        this._projectUsers.next(users);
      }));
  }

  addUserToProject(proj: Project, uname: string): void {
    const payload = {
      username: uname
    };
    this.http.post(this.envService.apiUrl + `/projects/${proj.id}/users/`, payload)
      .subscribe( (resp) => {
        this.getProjectUsers(proj).subscribe();
      });
  }

  deleteUserFromProject(proj: Project, uname: string): void {
    this.http.delete(this.envService.apiUrl + `/projects/${proj.id}/users/${uname}/`)
      .subscribe( (resp) => {
        this.getProjectUsers(proj).subscribe();
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

  exportProject(project: Project,
                system_id: string,
                path: string = '/',
                link: boolean,
                file_name: string = '') {
    file_name = file_name === '' ? project.uuid : file_name;

    const payload = {
      system_id,
      path,
      file_name,
      link
    };
    this.agaveSystemsService.saveDSFile(system_id, path, file_name, project);
    if (system_id.startsWith('project')) {
      this.agaveSystemsService.updateDSProjectInformation(system_id.replace('project-', ''),
                                                          path,
                                                          project,
                                                          AgaveFileOperations.Update);
    }

    this.http.put<any>(this.envService.apiUrl + `/projects/${project.id}/export/`, payload)
      .subscribe(currentProject => {
        this._projects.next([...this._projects.value.filter((p) => p.id !== project.id),
                             currentProject]);
        this._activeProject.next(currentProject);
      }, error => {
        this.notificationsService.showErrorToast(`Failed to save to ${system_id}/${path}/${file_name}!`);
      });
  }

  createRapidProject(data: RapidProjectRequest) {
    return this.http.post<Project>(this.envService.apiUrl + `/projects/rapid/`, data)
      .pipe(
        map( (proj) => {
          this.agaveSystemsService.saveDSFile(proj.system_id, proj.system_path, proj.system_file, proj);
          if (system_id.startsWith('project')) {
            this.agaveSystemsService.updateDSProjectInformation(proj.system_id.replace('project-', ''),
                                                                proj.system_path,
                                                                proj,
                                                                AgaveFileOperations.Update);
          }
          this._projects.next([proj, ...this._projects.value]);
          defaultTileServers.forEach(ts => {
            this.geoDataService.addTileServer(proj.id, ts, true);
          });
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

  setActiveProjectUUID(uuid: string, usePublicRoute: boolean = false): void {
    this._loadingActiveProject.next(true);
    this._loadingActiveProjectFailed.next(false);
    this._activeProject.next(null);
    this._projectUsers.next(null);

    const projectRoute = usePublicRoute ? 'public-projects' : 'projects';
    this.http.get<Project[]>(this.envService.apiUrl + `/${projectRoute}/?uuid=` + uuid)
      .subscribe( (resp) => {
        if (usePublicRoute) {
          this._activeProject.next(resp[0]);
          this._loadingActiveProject.next(false);

          if (this.authService.isLoggedIn()) {
            this.getProjectUsers(resp[0]).subscribe();
          }
        } else {
          //  as we are viewing the private map we need to get the project
          //  users. We also need to check that the current user is part of that list as
          //  it is possible that their request for the map was successful only due to the
          //  map being public
          this.getProjectUsers(resp[0]).subscribe( (users) => {
            // successful got the users which implies user is one of the map-projects' users
            this._activeProject.next(resp[0]);
            this._loadingActiveProject.next(false);
          }, error => {
            // logged in user is not a member of project's users so shouldn't have private access
            this._loadingActiveProject.next(false);
            this._loadingActiveProjectFailed.next(true);
          });
        }
        }, error => {
        this._loadingActiveProject.next(false);
        this._loadingActiveProjectFailed.next(true);
        }
      );
  }

  deleteProject(proj: Project): void {
    if (proj.system_id && proj.system_id.startsWith('project')) {
      this.agaveSystemsService.updateDSProjectInformation(proj.system_id.replace('project-', ''),
                                                          proj.system_path,
                                                          proj,
                                                          AgaveFileOperations.Delete);
    }

    if (proj.system_file) {
      this.agaveSystemsService.deleteDSFile(proj);
    }

    this.http.delete(this.envService.apiUrl + `/projects/${proj.id}/`)
      .subscribe( (resp) => {
        this.getProjects();
        this.router.navigate([MAIN]);
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
          // // Update the active project
          this._activeProject.next(updatedProject);

          return updatedProject;
        }),
        catchError((err: any) => {
          throw new Error('Unable to update project.');
        })
      );
  }

}
