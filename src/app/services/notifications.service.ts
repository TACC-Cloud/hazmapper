import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { INotification, IProgressNotification } from '../models/notification';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { EnvService } from '../services/env.service';
import { take, map } from 'rxjs/operators';
import { AuthService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // Interval time to get notifications in millisecs
  private TIMEOUT = 5000;
  private _notifications: ReplaySubject<Array<INotification>> = new ReplaySubject<Array<INotification>>(1);
  public readonly  notifications: Observable<Array<INotification>> = this._notifications.asObservable();
  private _progressNotifications: ReplaySubject<Array<IProgressNotification>> = new ReplaySubject<Array<IProgressNotification>>(1);
  public readonly  progressNotifications: Observable<Array<IProgressNotification>> = this._progressNotifications.asObservable();

  constructor(private toastr: ToastrService,
              private envService: EnvService,
              private http: HttpClient,
              private authService: AuthService ) {
    if (authService.isLoggedIn()) {
      const timer = interval(this.TIMEOUT);
      timer.subscribe((next) => {
        this.getRecent();
      });
    }
  }

  getRecent(): void {
    const baseUrl = this.envService.apiUrl + '/notifications/';
    const now = new Date();
    const then = new Date(now.getTime() - this.TIMEOUT);

    this.http.get<Array<INotification>>(baseUrl + `?startDate=${then.toISOString()}`)
      .subscribe( (notes) => {
        this._notifications.next(notes);
        notes.forEach( (note) => {
          switch (note.status) {
            case 'success':
              this.showSuccessToast(note.message);
              break;
            case 'warning':
              this.showWarningToast(note.message);
              break;
            case 'error':
              this.showErrorToast(note.message);
              break;
            default:
              break;
          }
        });
      });
  }

  showSuccessToast(message: string): void {
    this.toastr.success(message);
  }

  showWarningToast(message: string): void {
    this.toastr.warning(message);
  }

  showErrorToast(message: string): void {
    this.toastr.error(message);
  }

  initProgressPoll() {
    const timer = interval(this.TIMEOUT);
    const timerSub = timer.subscribe( (next) => {
      this.getRecentProgress();
    });
    return timerSub;
  }

  getRecentProgress(): void {
    const baseUrl = this.envService.apiUrl + '/notifications/progress';
    this.http.get<Array<IProgressNotification>>(baseUrl)
      .subscribe((notes) => {
        this._progressNotifications.next(notes);
      });
  }

  deleteAllDoneProgress(): void {
    const baseUrl = this.envService.apiUrl + '/notifications/progress';

    // this._progressNotifications.next([]);

    this.http.delete<Array<IProgressNotification>>(baseUrl)
      .subscribe((notes) => {
        // FIXME: Don't need
        this._progressNotifications.next(notes);
      });
  }

  deleteProgress(pn: IProgressNotification): void {
    const baseUrl = this.envService.apiUrl + '/notifications/progress';

    this.progressNotifications
      .pipe(take(1)).subscribe((progressList) => {
        progressList = progressList.filter(n => n.uuid != pn.uuid);
        this._progressNotifications.next(progressList)
      });

    this.http.delete<Array<IProgressNotification>>(baseUrl + '/' + pn.uuid)
      .subscribe(() => {
        this.showSuccessToast('Deleted progress: ' + pn.uuid);
      });
  }

  getProgressByUUID(pn: IProgressNotification): any {
    const baseUrl = this.envService.apiUrl + '/notifications/progress';
    this.http.get<Array<IProgressNotification>>(baseUrl + '/' + pn.uuid)
      .subscribe((note) => {
        return note;
      });
  }

}
