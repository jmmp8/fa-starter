import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatCardHarness} from '@angular/material/card/testing';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {BackendService} from '../backend.service';
import {User} from '../backend_response_types';
import {MyPoemsEditDialog} from '../my-poems-edit-dialog/my-poems-edit-dialog.component';
import {BackendServiceStub} from '../testing/backend-service-stub';

import {MyPoemsListComponent} from './my-poems-list.component';

describe('MyPoemsListComponent', () => {
  let backendServiceStub: BackendServiceStub;
  let component: MyPoemsListComponent;
  let fixture: ComponentFixture<MyPoemsListComponent>;
  let loader: HarnessLoader;
  let testUser: User;

  beforeEach(async () => {
    backendServiceStub = new BackendServiceStub();
    testUser = backendServiceStub.user[0];

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
            MyPoemsEditDialog,
            {data: undefined},
        );
  });

  it('should display the saved manual poems', async () => {
    let myPoemCards = await loader.getAllHarnesses(
        MatCardHarness.with({selector: '.my-poem-card'}));

    let expectedPoems =
        await backendServiceStub.getManualPoems(0, testUser.id, false);

    // Check that there is one card for each manual poem
    expect(myPoemCards.length).toEqual(expectedPoems.length);

    // Add a new manual poem and check again
    backendServiceStub.createPoem('new manual poem', 'some test text', false);

    myPoemCards = await loader.getAllHarnesses(
        MatCardHarness.with({selector: '.my-poem-card'}));
    expectedPoems =
        await backendServiceStub.getManualPoems(0, testUser.id, false);

    // Check that there is one card for each manual poem including the new one
    expect(myPoemCards.length).toEqual(expectedPoems.length);

    // Check the card contents
  });
});
