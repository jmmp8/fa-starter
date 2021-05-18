import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {BackendService} from '../backend.service';
import {Poem} from '../backend_response_types';
import {MyPoemsEditDialog} from '../my-poems-edit-dialog/my-poems-edit-dialog.component';

@Component({
  selector: 'app-my-poems-list',
  templateUrl: './my-poems-list.component.html',
  styleUrls: ['./my-poems-list.component.css']
})
export class MyPoemsListComponent implements OnInit {
  readonly myPoems$: Observable<Poem[]> = this.backendService.manualPoems$;

  newPoemMessage$?: Observable<string>;

  constructor(
      private backendService: BackendService,
      public editDialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.backendService.getManualPoems();
  }

  async openEditDialog(poem?: Poem): Promise<void> {
    this.editDialog.open(
        MyPoemsEditDialog,
        {data: poem},
    );
  }
}
