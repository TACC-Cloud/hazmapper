import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest } from 'rxjs';
import { Project, ProjectRequest, ProjectUpdateRequest } from '../models/models';
import { IpanelsDisplay, defaultPanelsDisplay } from '../models/ui';
import { catchError, map, tap } from 'rxjs/operators';
import { IProjectUser } from '../models/project-user';
import { NotificationsService } from './notifications.service';
import { EnvService } from '../services/env.service';
import { AuthService } from '../services/authentication.service';
import { MAIN } from '../constants/routes';
import { Router } from '@angular/router';

export interface ProjectsData {
  projects: Project[];
  failedMessage: string | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private _projects: BehaviorSubject<Project[]> = new BehaviorSubject([]);
  public readonly projects: Observable<Project[]> = this._projects.asObservable();
  private _activeProject: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);
  public readonly activeProject: Observable<Project> = this._activeProject.asObservable();

  private _projectUsers: ReplaySubject<Array<IProjectUser>> = new ReplaySubject<Array<IProjectUser>>(1);
  public readonly projectUsers$: Observable<Array<IProjectUser>> = this._projectUsers.asObservable();

  private _currentProjectUser: BehaviorSubject<IProjectUser> = new BehaviorSubject<IProjectUser>(null);
  public readonly currentProjectUser: Observable<IProjectUser> = this._currentProjectUser.asObservable();

  private _loadingProjects: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingProjects: Observable<boolean> = this._loadingProjects.asObservable();

  private _loadingProjectsFailedMessage: BehaviorSubject<string> = new BehaviorSubject('');
  public loadingProjectsFailedMessage: Observable<string> = this._loadingProjectsFailedMessage.asObservable();

  public readonly projectsData: Observable<ProjectsData>;

  private _loadingActiveProject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingActiveProject: Observable<boolean> = this._loadingActiveProject.asObservable();

  private _loadingActiveProjectFailed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingActiveProjectFailed: Observable<boolean> = this._loadingActiveProjectFailed.asObservable();

  private _deletingProjects: BehaviorSubject<Project[]> = new BehaviorSubject<Project[]>([]);
  public deletingProjects: Observable<Project[]> = this._deletingProjects.asObservable();

  private _panelsDisplay: BehaviorSubject<IpanelsDisplay> = new BehaviorSubject<IpanelsDisplay>(defaultPanelsDisplay);
  public panelsDisplay: Observable<IpanelsDisplay> = this._panelsDisplay.asObservable();

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private router: Router,
    private authService: AuthService,
    private envService: EnvService
  ) {
    this.projectsData = combineLatest([this.projects, this.loadingProjectsFailedMessage, this.loadingProjects]).pipe(
      map(([projects, failedMessage, loading]) => ({
        projects,
        failedMessage,
        loading,
      }))
    );
  }

  public getLastProjectKeyword() {
    return `${this.envService.env}LastProject`;
  }

  updateProjectsList(resp: Project[] = []) {
    const myProjs = resp.length !== 0 ? resp : this._projects.value;

    this._deletingProjects.value.length !== 0
      ? this._projects.next(
          myProjs.map((p) => {
            const deletingProj = this._deletingProjects.value.find((dp) => dp.id === p.id);
            return deletingProj ? deletingProj : p;
          })
        )
      : this._projects.next(myProjs);
  }

  getProjects(): void {
    this._loadingProjects.next(true);
    this._loadingProjectsFailedMessage.next(null);
    this.http.get<Project[]>(this.envService.apiUrl + `/projects/`).subscribe(
      (resp) => {
        this.updateProjectsList(resp);
        this._loadingProjects.next(false);
        this._loadingProjectsFailedMessage.next(null);
      },
      (error) => {
        this._loadingProjects.next(false);
        this._loadingProjectsFailedMessage.next(error.message || 'An error occured.');
      }
    );
  }

  // TODO: Utilize project metdata
  getProjectUsers(proj: Project): Observable<Array<IProjectUser>> {
    return this.http.get<Array<IProjectUser>>(this.envService.apiUrl + `/projects/${proj.id}/users/`).pipe(
      tap((users) => {
        this._projectUsers.next(users);
      })
    );
  }

  create(data: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.envService.apiUrl + `/projects/`, data).pipe(
      tap((proj) => {
        // Spread operator, just pushes the new project into the array
        this._projects.next([...this._projects.value, proj]);
      })
    );
  }

  setActiveProjectUUID(uuid: string, usePublicRoute: boolean = false): void {
    this._loadingActiveProject.next(true);
    this._loadingActiveProjectFailed.next(false);
    this._activeProject.next(null);
    this._projectUsers.next(null);

    this.http.get<Project[]>(this.envService.apiUrl + `/projects/?uuid=` + uuid).subscribe(
      (resp) => {
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
          this.getProjectUsers(resp[0]).subscribe(
            (users) => {
              // successful got the users which implies user is one of the map-projects' users
              this._activeProject.next(resp[0]);
              this._loadingActiveProject.next(false);
            },
            (error) => {
              // logged in user is not a member of project's users so shouldn't have private access
              this._loadingActiveProject.next(false);
              this._loadingActiveProjectFailed.next(true);
            }
          );
        }
      },
      (error) => {
        this._loadingActiveProject.next(false);
        this._loadingActiveProjectFailed.next(true);
      }
    );
  }

  deleteProject(proj: Project): void {
    this._deletingProjects.next([...this._deletingProjects.value, { ...proj, deleting: true }]);
    this.updateProjectsList();

    this.router.navigate([MAIN]);

    this.http.delete(this.envService.apiUrl + `/projects/${proj.id}/`).subscribe(
      (resp) => {
        this._deletingProjects.next(this._deletingProjects.value.filter((p) => p.id !== proj.id));
        this.updateProjectsList();
        this.getProjects();
      },
      (error) => {
        this._deletingProjects.next(
          this._deletingProjects.value.map((p) => {
            return p.id === proj.id ? { ...p, deleting: false, deletingFailed: true } : p;
          })
        );
        this.updateProjectsList();

        this.getProjects();

        this.notificationsService.showErrorToast('Could not delete project!');
        console.error(error);
      }
    );
  }

  updateProject(project: Project, projectUpdate: ProjectUpdateRequest): void {
    this.http.put(this.envService.apiUrl + `/projects/${project.id}/`, projectUpdate).subscribe((resp) => {
      this.notificationsService.showSuccessToast('Uploaded file!');
    });
  }

  updateActiveProject(name: string, description: string, isPublic: boolean) {
    name = name ? name : this._activeProject.value.name;
    description = description ? description : this._activeProject.value.description;
    isPublic = isPublic !== undefined ? isPublic : this._activeProject.value.public;

    const payload: ProjectUpdateRequest = {
      name,
      description,
      public: isPublic,
    };

    return this.http.put<Project>(this.envService.apiUrl + `/projects/${this._activeProject.value.id}/`, payload).pipe(
      map((updatedProject) => {
        // Update the project list
        const projects = this._projects.value.map((proj) => (proj.id === this._activeProject.value.id ? updatedProject : proj));
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

  setPanelsDisplay(panelName: string): void {
    const panelsDisplay = this._panelsDisplay.value;
    for (const key in panelsDisplay) {
      if (key !== panelName) {
        panelsDisplay[key] = false;
      }
    }

    panelsDisplay[panelName] = !panelsDisplay[panelName];

    this._panelsDisplay.next(panelsDisplay);
  }

  disablePanelsDisplay(): void {
    const panelsDisplay = this._panelsDisplay.value;
    // tslint:disable-next-line
    for (const key in panelsDisplay) {
      panelsDisplay[key] = false;
    }
    this._panelsDisplay.next(panelsDisplay);
  }
}
