import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AgaveArrayResponse, FileInfo} from "../models/agave-models";


@Injectable({
  providedIn: 'root'
})
export class AgaveFilesService {

  private baseUrl = 'https://agave.designsafe-ci.org/files/v2/';
  public currentListing: Array<FileInfo>;


  constructor(private http:HttpClient) { }

  listFiles(system: string, path: string): Observable<FileInfo[]> {
    let prom =  this.http.get<AgaveArrayResponse>(this.baseUrl + `listings/system/${system}/${path}`).pipe(
      map(resp=>{
        return resp.result.map(f=><FileInfo>f);
      })
    );
    prom.subscribe(resp=>{
      this.currentListing = resp;
    });
    return prom;
  }
}
