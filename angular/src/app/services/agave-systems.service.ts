import { Injectable } from '@angular/core';
import { System, SystemSummary } from 'ng-tapis';
import { ApiService } from 'ng-tapis';
import { NotificationsService } from './notifications.service';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { DesignSafeProjectCollection, Project, AgaveFileOperations } from '../models/models';

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
    private tapis: ApiService,
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
    this.tapis.systemsList({ type: 'STORAGE' }).subscribe(
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

    // TODO_TAPIS_V3 mock a response from projects endpoint and use designsafe directly i.e. /api/projects
    this.http.get<DesignSafeProjectCollection>(this.envService.designSafeUrl + `/projects/v2/`).subscribe(
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

  updateProjectMetadata(proj: Project, operation: AgaveFileOperations) {
    const DSuuid = proj.system_id.replace('project-', '');
    const uuid = proj.uuid;
    const path = proj.system_path;
    const name = proj.name;

    this.http.get<any>(this.envService.designSafeUrl + `projects/v2/${DSuuid}/`).subscribe((dsProject) => {
      const previousMaps = dsProject.value.hazmapperMaps ? dsProject.value.hazmapperMaps.filter((e) => e.uuid !== uuid) : [];

      const payloadProject =
        operation === AgaveFileOperations.Update
          ? [
              {
                name,
                uuid,
                path,
                deployment: this.envService.env,
              },
            ]
          : [];

      const payload = {
        DSuuid,
        hazmapperMaps: [...previousMaps, ...payloadProject],
      };

      const headers = new HttpHeaders().set('X-Requested-With', 'XMLHttpRequest');

      this.http.post<any>(this.envService.designSafeUrl + `projects/v2/${DSuuid}/`, payload, { headers }).subscribe(
        (resp) => {
          console.log(resp);
        },
        (error) => {
          console.log(error);
        }
      );
    });
  }

  public saveFile(proj: Project) {
    const data = JSON.stringify({
      uuid: proj.uuid,
      deployment: this.envService.env,
    });

    this.tapis
      .filesImport({
        systemId: proj.system_id,
        filePath: proj.system_path,
        body: {
          fileType: 'plain/text',
          callbackURL: '',
          fileName: `${proj.system_file}.hazmapper`,
          urlToIngest: '',
          fileToUpload: data,
        },
      })
      .subscribe(
        (resp) => {
          this.notificationsService.showSuccessToast(`Successfully saved file to ${proj.system_id}${proj.system_path}.`);
        },
        (error) => {
          this.notificationsService.showErrorToast(`Failed to save file to ${proj.system_id}${proj.system_path}.`);
        }
      );
  }

  public deleteFile(proj: Project) {
    this.tapis
      .filesDelete({
        systemId: proj.system_id,
        filePath: `${proj.system_path}/${proj.system_file}.hazmapper`,
      })
      .subscribe(
        (resp) => {
          this.notificationsService.showSuccessToast(
            `Successfully deleted file ${proj.system_id}${proj.system_path}/${proj.system_file}.hazmapper.`
          );
        },
        (error) => {
          // TODO: Handle this
          // 404 happens when redundant delete
          // 502/500 I'm not sure why...
          console.log(error);
        }
      );
  }
}
