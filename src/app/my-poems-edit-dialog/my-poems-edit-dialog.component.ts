import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-my-poems-edit-dialog',
  templateUrl: './my-poems-edit-dialog.component.html',
  styleUrls: ['./my-poems-edit-dialog.component.css']
})
export class MyPoemsEditDialogComponent {
  submit(poemName: string, poemText: string): void {
    console.log(poemName, poemText);
  }

  canSubmit(poemName: string, poemText: string): boolean {
    return (poemName.trim().length > 0) && (poemText.trim().length > 0);
  }

  cancel(): void {
    console.log('canceling');
  }
}
