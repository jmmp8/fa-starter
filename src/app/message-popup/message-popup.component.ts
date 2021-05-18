import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.css']
})
export class MessagePopup {
  constructor(
      @Inject(MAT_SNACK_BAR_DATA) public data$: Observable<string>,
      public snackBar: MatSnackBar,
  ) {}

  dismiss(): void {
    this.snackBar.dismiss();
  }
}
