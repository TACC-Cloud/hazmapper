import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-foundation/modal';

import { ModalConfirmationBodyComponent } from '../components/modal-confirmation-body/modal-confirmation-body.component';

@Injectable()
export class ModalService {
  bsModalRef: BsModalRef;

  constructor(private bsModalService: BsModalService) {}

  confirm(title: string, message: string, options: string[]): Observable<string> {
    const initialState = {
      title,
      message,
      options,
    };
    this.bsModalRef = this.bsModalService.show(ModalConfirmationBodyComponent, {
      initialState,
    });

    return new Observable<string>(this.getConfirmSubscriber());
  }

  private getConfirmSubscriber() {
    return (observer) => {
      const subscription = this.bsModalService.onHidden.subscribe((reason: string) => {
        observer.next(this.bsModalRef.content.answer);
        observer.complete();
      });

      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    };
  }
}
