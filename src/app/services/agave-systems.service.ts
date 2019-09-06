import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AgaveSystem, AgaveSystemsListResponse} from "../models/agave-models";
import {map, publishReplay, refCount, take} from "rxjs/operators";
import {Observable, ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AgaveSystemsService {

  private baseUrl = 'https://agave.designsafe-ci.org/systems/v2/';
  private _systems: ReplaySubject<AgaveSystem[]> = new ReplaySubject<AgaveSystem[]>(1);
  public readonly systems: Observable<AgaveSystem[]>;
  private _projects: ReplaySubject<AgaveSystem[]> = new ReplaySubject<AgaveSystem[]>(1);
  public readonly projects: Observable<AgaveSystem[]> = this._projects.asObservable();
  private systemsList: AgaveSystem[];

  constructor(private http: HttpClient) { }

  list() {
    this.http.get<AgaveSystemsListResponse>(this.baseUrl+'?type=storage')
      .subscribe(resp=>{
        this.systemsList = resp.result;
        this._systems.next(resp.result);
        this._projects.next(resp.result.filter(sys=>sys.id.startsWith('project')));
      }, error => {
        this._systems.next(null);
        this._projects.next(null);
      });
  }
}
