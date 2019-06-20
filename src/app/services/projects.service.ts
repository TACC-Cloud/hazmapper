import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "../models/models";
import {map} from "rxjs/operators";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private http: HttpClient) { }

  // TODO: Add types on the observable
  getProjects (): Observable<Project[]> {
    return this.http.get<Project[]>(environment.apiUrl + `/api/projects/`)
  }
}
