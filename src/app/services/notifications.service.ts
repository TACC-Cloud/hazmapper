import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private toastr: ToastrService) { }

  showSuccessToast(message: string): void {
    this.toastr.success(message);
  }

  showErrorToast(message: string): void {
    this.toastr.error(message);
  }

}
