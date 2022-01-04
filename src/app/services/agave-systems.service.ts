import { Injectable } from '@angular/core';
import {System, SystemSummary} from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {NotificationsService} from './notifications.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { EnvService } from '../services/env.service';
import {catchError, map, tap, filter, take} from 'rxjs/operators';
import { DesignSafeProjectCollection, Project, AgaveFileOperations, DesignSafeProject } from '../models/models';

@Injectable({
  providedIn: 'root'
})

export class AgaveSystemsService {

  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();
  private _projects: ReplaySubject<any> = new ReplaySubject<any>(1);
  public readonly projects: Observable<any> = this._projects.asObservable();

  constructor(
    private tapis: ApiService,
    private notificationsService: NotificationsService,
    private envService: EnvService,
    private http: HttpClient) { }

  list() {
    this.tapis.systemsList({type: 'STORAGE'})
      .subscribe(resp => {
        this._systems.next(resp.result);
      }, error => {
        this._systems.next(null);
      });
    this.getDSProjects().subscribe();
  }

  getDSProjects(): Observable<any[]> {
    return this.http.get<DesignSafeProjectCollection>(this.envService.designSafeUrl + `/projects/v2/`)
      .pipe(
        map(resp => resp.projects.map(project => ({
          id: 'project-' + project.uuid,
          name: project.value.projectId,
          description: project.value.title,
        }))),
        tap(projects => {
          this._projects.next(projects)
        }),
        catchError((err: any) => {
          this._projects.next(null);
          throw new Error('Unable to get DesignSafe projects');
        })
      );
  }

  mapDSProjects(projects: Project[], dsProjects: SystemSummary[]): Project[] {
    if (dsProjects.length > 0) {
      return projects.map(p => {
        const dsProject = dsProjects.find(dp => dp.id === p.system_id);
        p.title = dsProject ? dsProject.description : null;
        p.ds_id = dsProject ? dsProject.name : null;
        return p;
      });
    }
    return projects;
  }

  updateDSProjectInformation(designsafeUUID: string, path: string, project: Project, operation: AgaveFileOperations) {
    this.http.get<any>(this.envService.designSafeUrl + `projects/v2/${designsafeUUID}/`).subscribe(dsProject => {
      const previousMaps = dsProject.value.hazmapperMaps
        ? dsProject.value.hazmapperMaps.filter(e => e.uuid !== project.uuid)
        : [];

      const payloadProject = operation === AgaveFileOperations.Update
        ? [{
            name: project.name,
            uuid: project.uuid,
            path,
            deployment: this.envService.env
          }]
        : [];

      const payload = {
        uuid: designsafeUUID,
        hazmapperMaps: [
          ...previousMaps,
          ...payloadProject
        ]
      };

      const headers = new HttpHeaders()
        .set('X-Requested-With', 'XMLHttpRequest');

      this.http.post<any>(this.envService.designSafeUrl + `projects/v2/${designsafeUUID}/`, payload, {headers})
        .subscribe( resp => {
          console.log(resp);
        }, error => {
          console.log(error);
        });
    });
  }

  public saveDSFile(systemId: string, path: string, fileName: string, project: Project) {
    const data: any = {
      uuid: project.uuid,
      deployment: this.envService.env
    };

    const dataJSON = JSON.stringify(data);

    this.tapis.filesImport({
      systemId,
      filePath: path,
      body: {
        fileType: 'plain/text',
        callbackURL: '',
        fileName: fileName + '.hazmapper',
        urlToIngest: '',
        fileToUpload: dataJSON
      }
    }).subscribe(resp => {
      this.notificationsService.showSuccessToast(`Successfully saved file to ${systemId}${path}.`);
    }, error => {
      this.notificationsService.showErrorToast(`Failed to save file to ${systemId}${path}.`);
    });
  }

  public deleteDSFile(proj: Project) {
    this.tapis.filesDelete({systemId: proj.system_id, filePath: `${proj.system_path}/${proj.system_file}`})
      .subscribe(resp => {
        this.notificationsService.showSuccessToast(`Successfully deleted file from ${proj.system_id}${proj.system_path}.`);
      }, error => {
        this.notificationsService.showErrorToast(`Failed to delete file from ${proj.system_id}${proj.system_path}.`);
      });
  }
}
