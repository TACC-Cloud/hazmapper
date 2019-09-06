import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {AgaveFileListingResponse, FileInfo} from "../models/agave-models";
import {catchError, retry} from "rxjs/operators";
import {of} from "rxjs"

@Injectable({
  providedIn: 'root'
})
export class AgaveFilesService {

  private baseUrl = 'https://agave.designsafe-ci.org/files/v2/';
  public currentListing: Array<FileInfo>;
  private _listing: BehaviorSubject<FileInfo[]> = new BehaviorSubject<FileInfo[]>([]);
  public readonly listing: Observable<FileInfo[]> = this._listing.asObservable();

  constructor(private http:HttpClient) { }

  listFiles(system: string, path: string) {
    this.http.get<AgaveFileListingResponse>(this.baseUrl + `listings/system/${system}/${path}`)

      .subscribe(resp=> {
        let files = resp.result;
        //This removes the first item in the listing, which in Agave is always a reference to self.
        let current = files.shift();
        current.path = this.getParentPath(current.path);
        current.name = "..";
        files.unshift(current);
        this._listing.next(files);
      });
  }

  private getParentPath(path: string): string {
    let cleaned = path.replace("//", "/");
    let arr = cleaned.split("/");
    arr.pop();
    let parentPath = arr.join("/");
    return parentPath;
  }

}
