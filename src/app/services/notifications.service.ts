import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {HttpClient} from '@angular/common/http';
import {INotification} from '../models/notification';
import {interval, Observable, ReplaySubject, BehaviorSubject} from 'rxjs';
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
  private _loadingFeatureData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingFeatureData: Observable<boolean> = this._loadingFeatureData.asObservable();
  private _loadingPointCloudData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingPointCloudData: Observable<boolean> = this._loadingPointCloudData.asObservable();
  private _loadingOverlayData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingOverlayData: Observable<boolean> = this._loadingOverlayData.asObservable();

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

  setLoadFeatureData(isLoading: boolean): void {
    this._loadingFeatureData.next(isLoading);
  }

  setLoadPointCloudData(isLoading: boolean): void {
    this._loadingPointCloudData.next(isLoading);
  }

  setLoadOverlayData(isLoading: boolean): void {
    this._loadingOverlayData.next(isLoading);
  }

}
