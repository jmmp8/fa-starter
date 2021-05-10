import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Poem} from '../backend_response_types';
import {MyPoemsEditDialogComponent} from '../my-poems-edit-dialog/my-poems-edit-dialog.component';

@Component({
  selector: 'app-my-poems-list',
  templateUrl: './my-poems-list.component.html',
  styleUrls: ['./my-poems-list.component.css']
})
export class MyPoemsListComponent {
  constructor(public editDialog: MatDialog) {}

  openEditDialog(poem?: Poem): void {
    const dialogRef = this.editDialog.open(MyPoemsEditDialogComponent);
  }
}
