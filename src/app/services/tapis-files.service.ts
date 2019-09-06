import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import { ApiService} from "ng-tapis";
import {RemoteFile} from "ng-tapis";

@Injectable({
  providedIn: 'root'
})
export class TapisFilesService {

  private baseUrl = 'https://agave.designsafe-ci.org/files/v2/';
  public currentListing: Array<RemoteFile>;
  private _listing: BehaviorSubject<RemoteFile[]> = new BehaviorSubject<RemoteFile[]>([]);
  public readonly listing: Observable<RemoteFile[]> = this._listing.asObservable();

  constructor(private tapis:ApiService) { }

  listFiles(system: string, path: string) {
    this.tapis.filesList({systemId:system, filePath:path})
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
