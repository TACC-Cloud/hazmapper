import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {HttpClient} from '@angular/common/http';
import {INotification, IProgressNotification} from '../models/notification';
import {interval, Observable, ReplaySubject} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // Interval time to get notifications in millisecs
  private TIMEOUT = 5000;
  private environment = environment;
  private _notifications: ReplaySubject<Array<INotification>> = new ReplaySubject<Array<INotification>>(1);
  public readonly  notifications: Observable<Array<INotification>> = this._notifications.asObservable();

  private _progressNotifications: ReplaySubject<Array<IProgressNotification>> = new ReplaySubject<Array<IProgressNotification>>(1);
  public readonly  progressNotifications: Observable<Array<IProgressNotification>> = this._progressNotifications.asObservable();

  constructor(private toastr: ToastrService, private http: HttpClient) {
    const timer = interval(this.TIMEOUT);
    timer.subscribe( (next) => {
      this.getRecent();
    });
  }

  getRecent(): void {
    const baseUrl = this.environment.apiUrl + '/notifications/';
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

  showErrorToast(message: string): void {
    this.toastr.error(message);
  }

  initProgressPoll() {
    const timer = interval(this.TIMEOUT);
    console.log("Hey there");
    console.log(this.TIMEOUT);
    timer.subscribe( (next) => {
      this.getRecentProgress();
    });
    return timer;
  }

  getRecentProgress(): void {
    const baseUrl = this.environment.apiUrl + '/notifications/progress';
    const now = new Date();
    const then = new Date(now.getTime() - this.TIMEOUT);
    console.log("Hey there")

    this.http.get<Array<IProgressNotification>>(baseUrl + `?startDate=${then.toISOString()}`)
      .subscribe( (notes) => {
        this._progressNotifications.next(notes);
        // notes.forEach( (note) => {
        //   switch (note.status) {
        //     case 'success':
        //       this.showSuccessToast(note.message);
        //       break;
        //     case 'error':
        //       this.showErrorToast(note.message);
        //       break;
        //     default:
        //       break;
        //   }

        // });
      });
  }

}
