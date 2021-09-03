import { Injectable } from '@angular/core';
import {System, SystemSummary} from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import {NotificationsService} from './notifications.service';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { DesignSafeProjectCollection, Project } from '../models/models';

@Injectable({
  providedIn: 'root'
})

export class AgaveSystemsService {

  private _systems: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly systems: Observable<SystemSummary[]> = this._systems.asObservable();
  private _projects: ReplaySubject<SystemSummary[]> = new ReplaySubject<SystemSummary[]>(1);
  public readonly projects: Observable<SystemSummary[]> = this._projects.asObservable();
  constructor(private tapis: ApiService, 
              private envService: EnvService, 
              private notificationsService: NotificationsService,
              private http: HttpClient) { }

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

  public uploadFile(uuid: string, systemID: string, path: string, fileName: string) {
    const rawdata = {
      uuid
    };
    const data = JSON.stringify(rawdata);
    const fileType = 'plain/text';
    const tmp = new Blob([data], {type: fileType});
    const date = new Date();
    const file = new File([tmp], `${fileName}.hazmapper`, {lastModified: date.valueOf()});

    const form: FormData = new FormData();
    form.append('fileToUpload', file);

    this.http.post(this.envService.designSafeUrl + `files/v2/media/system/${systemID}${path}`, form).subscribe(resp => {
      this.notificationsService.showSuccessToast('Saved file to DesignSafe!');
    }, error => {
      this.notificationsService.showErrorToast('Could not save file to DesignSafe!');
    });
  }

  public deleteFile(systemID: string, path: string, fileName: string) {
    this.http.delete(this.envService.designSafeUrl + `files/v2/media/system/${systemID}${path}/${fileName}.hazmapper`).subscribe(resp => {
      this.notificationsService.showErrorToast('Removed file from Designsafe!');
    }, error => {
      this.notificationsService.showErrorToast('Could not remove file from Designsafe!');
      console.error(error);
    });
  }

}
