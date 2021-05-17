import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {BackendService} from '../backend.service';

import {Poem} from '../backend_response_types';

@Component({
  selector: 'app-my-poems-edit-dialog',
  templateUrl: './my-poems-edit-dialog.component.html',
  styleUrls: ['./my-poems-edit-dialog.component.css']
})
export class MyPoemsEditDialog {
  poemName = '';
  poemText = '';

  constructor(
      private backendService: BackendService,
      public dialogRef: MatDialogRef<MyPoemsEditDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Poem,
  ) {}

  canSubmit(): boolean {
    return (this.poemName.trim().length > 0) &&
        (this.poemText.trim().length > 0);
  }

  async submit(): Promise<void> {
    if (this.canSubmit()) {
      const response = await firstValueFrom(
          this.backendService.createPoem(this.poemName, this.poemText, false));

      if (!response) {
        throw new Error(
            'Failed to get a response from the backend for creating a poem');
      }
    }
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
