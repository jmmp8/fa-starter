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

  async openEditDialog(poem?: Poem): Promise<void> {
    this.editDialog.open(
        MyPoemsEditDialogComponent,
        {data: poem},
    );
  }
}
