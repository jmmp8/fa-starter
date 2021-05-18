import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs/operators';
import {BackendService} from '../backend.service';

import {Poem} from '../backend_response_types';
import {MessagePopup} from '../message-popup/message-popup.component';

@Component({
  selector: 'app-my-poems-edit-dialog',
  templateUrl: './my-poems-edit-dialog.component.html',
  styleUrls: ['./my-poems-edit-dialog.component.css']
})
export class MyPoemsEditDialog {
  existingPoem: Poem;
  poemName = '';
  poemText = '';

  constructor(
      private backendService: BackendService,
      private dialogRef: MatDialogRef<MyPoemsEditDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Poem,
      private snackBar: MatSnackBar,
  ) {
    if (data) {
      this.existingPoem = data;
      this.poemName = data.name;
      this.poemText = data.text;
    }
  }

  canSubmit(): boolean {
    return (this.poemName.trim().length > 0) && (this.poemText.length > 0);
  }

  async submit(): Promise<void> {
    if (this.canSubmit()) {
      if (this.existingPoem) {
        this.existingPoem.name = this.poemName;
        this.existingPoem.text = this.poemText;

        this.snackBar.openFromComponent(
            MessagePopup,
            {
              data: this.backendService.editPoem(this.existingPoem)
                        .pipe(
                            map(response => response ? 'Poem edit complete.' :
                                                       'Failed to edit poem.'))
            },
        );
      } else {
        this.snackBar.openFromComponent(
            MessagePopup,
            {
              data: this.backendService
                        .createPoem(this.poemName, this.poemText, false)
                        .pipe(map(
                            response => response ? 'Poem Created!' :
                                                   'Failed to create poem.'))
            },
        );
      }
    }
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
