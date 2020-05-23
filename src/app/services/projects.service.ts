import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject, of} from 'rxjs';
import {Project} from '../models/models';
import { environment } from '../../environments/environment';
import { RapidProjectRequest } from '../models/rapid-project-request';
import {catchError, map, tap} from 'rxjs/operators';
import {IProjectUser} from '../models/project-user';
import {NotificationsService} from './notifications.service';
import {FilterService} from "./filter.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private _projects: BehaviorSubject<Project[]> = new BehaviorSubject([]);
  public readonly projects: Observable<Project[]> = this._projects.asObservable();
  private _activeProject: ReplaySubject<Project> = new ReplaySubject<Project>(1);
  public readonly  activeProject: Observable<Project> = this._activeProject.asObservable();
  private _projectUsers: ReplaySubject<Array<IProjectUser>> = new ReplaySubject<Array<IProjectUser>>(1);
  public readonly projectUsers$: Observable<Array<IProjectUser>> = this._projectUsers.asObservable();

  constructor(private http: HttpClient, private notificationsService: NotificationsService) { }

  getProjects(): void {
   this.http.get<Project[]>(environment.apiUrl + `/projects/`).subscribe( resp => {
     this._projects.next(resp);
   });
  }

  getProjectUsers(proj: Project): void {
    this.http.get<Array<IProjectUser>>(environment.apiUrl + `/projects/${proj.id}/users/`)
      .subscribe( (resp) => {
        this._projectUsers.next(resp);
      });
  }

  addUserToProject(proj: Project, uname: string): void {
    const payload = {
      username: uname
    };
    this.http.post(environment.apiUrl + `/projects/${proj.id}/users/`, payload)
      .subscribe( (resp) => {
        this.getProjectUsers(proj);
      });
  }


  create(data: Project): Observable<Project> {
    return this.http.post<Project>(environment.apiUrl + `/projects/`, data)
      .pipe(
        tap(proj => {
          // Spread operator, just pushes the new project into the array
          this._projects.next([...this._projects.value, proj]);
          // Set the active project to the one just created?
          this._activeProject.next(proj);
        }),
      );
  }

  createRapidProject(data: RapidProjectRequest) {
    return this.http.post<Project>(environment.apiUrl + `/projects/rapid/`, data)
      .pipe(
        map( (proj) => {
          this._projects.next([proj, ...this._projects.value]);
          // Set the active project to the one just created?
          this._activeProject.next(proj);
          return proj;
        })
      ).pipe(
        catchError( (err) =>  {
          throw new Error('This project/folder is already a map project!');
        })
      );

  }

  setActiveProject(proj: Project): void {
    this._activeProject.next(proj);
    this.getProjectUsers(proj);
  }

  deleteProject(proj: Project): void {
    this.http.delete(environment.apiUrl + `/projects/${proj.id}/`)
      .subscribe( (resp) => {
        this.getProjects();
      }, error => {
        this.notificationsService.showErrorToast('Could not delete project!');
      });
  }

}
