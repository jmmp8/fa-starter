import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatCardHarness} from '@angular/material/card/testing';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {BackendService} from '../backend.service';
import {MyPoemsEditDialogComponent} from '../my-poems-edit-dialog/my-poems-edit-dialog.component';
import {BackendServiceStub} from '../testing/backend-service-stub';

import {MyPoemsListComponent} from './my-poems-list.component';

describe('MyPoemsListComponent', () => {
  let backendServiceStub: BackendServiceStub;
  let component: MyPoemsListComponent;
  let fixture: ComponentFixture<MyPoemsListComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    backendServiceStub = new BackendServiceStub();

    await TestBed
        .configureTestingModule({
          imports: [
            MatCardModule,
            MatDialogModule,
          ],
          declarations: [MyPoemsListComponent],
          providers: [
            {provide: BackendService, useValue: backendServiceStub},
          ],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a new poem dialog', () => {
    // Spy on the dialog's open call
    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');

    // Click the card to attempt to add a new poem
    const newPoemCard =
        fixture.nativeElement.querySelector('.new-my-poems-card');
    if (!newPoemCard) throw new Error('Failed to find New Poem card');
    newPoemCard.click();
    fixture.detectChanges();

    // Check that the dialog open was called
    expect(dialog.open)
        .toHaveBeenCalledOnceWith(
            MyPoemsEditDialogComponent,
            {data: undefined},
        );
  });
});
