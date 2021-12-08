import { Injectable } from '@angular/core';
import {System, SystemSummary} from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {NotificationsService} from './notifications.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { DesignSafeProjectCollection, Project, AgaveFileOperations } from '../models/models';

@Injectable({
  providedIn: 'root'
})

export class AgaveSystemsService {

  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();
  private _projects: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly projects: Observable<SystemSummary[]> = this._projects.asObservable();
  constructor(private tapis: ApiService, private notificationsService: NotificationsService, private envService: EnvService, private http: HttpClient) { }

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
            name: project.value.projectId,
            description: project.value.title,
          };
        });
        this._projects.next(projectSystems);
      }, error => {
        this._projects.next(null);
      });
  }

  getDSProjectInformation(projects: Project[], dsProjects: SystemSummary[]): Project[] {
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
        designsafeUUID,
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
      uuid: project.uuid
    };

    const fileType = "plain/text";
    const tmp = new Blob([data], {type: fileType});
    const date = new Date();
    const file = new File([tmp], fileName + ".hazmapper", {lastModified: date.valueOf()});

    const form: FormData = new FormData;
    form.append("fileToUpload", file)

    this.http.post(this.envService.designSafeUrl + `files/v2/media/system/${systemId}${path}`, form).subscribe(resp => {
      console.log(resp);
      this.notificationsService.showSuccessToast(`Successfully saved file to ${systemId}${path}.`);
    }, error => {
      this.notificationsService.showErrorToast(`Failed to save file to ${systemId}${path}.`);
    })
  }

  public deleteDSFile(proj: Project) {
    this.http.delete(this.envService.designSafeUrl + `files/v2/media/system/${proj.system_id}${proj.system_path}/${proj.system_file}`).subscribe(resp => {
      this.notificationsService.showSuccessToast(`Successfully deleted file from ${proj.system_id}${proj.system_path}.`);
    }, error => {
      this.notificationsService.showErrorToast(`Failed to delete file from ${proj.system_id}${proj.system_path}.`);
    })
  }
}
