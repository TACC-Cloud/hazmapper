import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {DesignSafeProjectCollection, Project} from '../models/models';
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
      // this.getDSInformation(resp);
      this._loadingProjectsFailed.next(false);
    }, error => {
      this._loadingProjectsFailed.next(true);
      this.notificationsService.showErrorToast('Failed to retrieve project data! Geoapi might be down.');
    });
  }

  // getDSProjectInformation(projects: Project[]): Project[] {
  //   return dsProjects.length > 0
  //     ? projects.map(p => {
  //       const pDir = dsProjects.find(dp => 'project-' + dp.uuid === p.system_id);
  //       p.systemName = pDir ? pDir.value.title : null;
  //       p.dsName = pDir ? pDir.value.projectId : null;
  //       return p;
  //     })
  //     : projects;
  // }

  // getDSProjectInformation(projects?: Project[], currentProject?: Project): void {
  //   return this.agaveSystemsService.getDSProjectIdObs()
  //     .subscribe((resp: DesignSafeProjectCollection) => {
  //       const dsProjects = resp.projects;
  //       if (projects) {
  //         const newProjects = dsProjects.length > 0
  //           ? projects.map(p => {
  //             const pDir = dsProjects.find(dp => 'project-' + dp.uuid === p.system_id);
  //             p.systemName = pDir ? pDir.value.title : null;
  //             p.dsName = pDir ? pDir.value.projectId : null;
  //             return p;
  //           })
  //           : projects;

  //         console.log(newProjects);
  //         this._projects.next(newProjects);
  //       }
  //       if (currentProject) {
  //         const pDir = dsProjects.find(dp => 'project-' + dp.uuid === currentProject.system_id);
  //         currentProject.systemName = pDir ? pDir.value.title : null;
  //         currentProject.dsName = pDir ? pDir.value.projectId : null;
  //         this._activeProject.next(currentProject);
  //       }
  //     });
  // }

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
          // this.getDSInformation([...this._projects.value, proj], undefined);
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

    this.http.put<any>(this.envService.apiUrl + `/projects/${project.id}/export/`, payload)
      .subscribe(currentProject => {
        this.notificationsService.showSuccessToast(`Create file ${system_id}/${path}/${file_name}.hazmapper`);
        // this.getDSInformation([...this._projects.value.filter((p) => p.id !== project.id)], currentProject);
        this._projects.next([...this._projects.value.filter((p) => p.id != project.id),
                             currentProject]);
        this.setActiveProject(currentProject);

        // if (dsProjects) {
        //   if (projects.length > 0) {
        //     this.projects = dsProjects.length > 0
        //       ? projects.map(p => {
        //         const pDir = dsProjects.find(dp => dp.id === p.system_id);
        //         p.dsName = pDir ? pDir.dsId : null;
        //         return p;
        //       })
        //       : projects;
        //     this.spinner = false;
        //   } else {
        //     this.spinner = true;
        //   }
        // }

      }, error => {
        this.notificationsService.showErrorToast(`Failed to create file ${system_id}/${path}/${file_name}.hazmapper`);
        console.log(error);
      });
  }

  createRapidProject(data: RapidProjectRequest) {
    return this.http.post<Project>(this.envService.apiUrl + `/projects/rapid/`, data)
      .pipe(
        map( (proj) => {
          this._projects.next([proj, ...this._projects.value]);
          // this.getDSInformation([...this._projects.value, proj], undefined);
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
    // this.getDSInformation(undefined, proj);
    if (proj && this.authService.isLoggedIn()) {
      this.getProjectUsers(proj);
    }
  }

  deleteProject(proj: Project): void {
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
          // this._projects.next(projects);
          // // Update the active project
          this._activeProject.next(updatedProject);

          // this.getDSInformation(projects, updatedProject);
          return updatedProject;
        }),
        catchError((err: any) => {
          throw new Error('Unable to update project.');
        })
      );
  }

}
