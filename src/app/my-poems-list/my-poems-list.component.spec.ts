import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatCardModule} from '@angular/material/card';
import {MatCardHarness} from '@angular/material/card/testing';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {BackendService} from '../backend.service';
import {Poem, User} from '../backend_response_types';
import {MyPoemsEditDialog} from '../my-poems-edit-dialog/my-poems-edit-dialog.component';
import {BackendServiceStub} from '../testing/backend-service-stub';

import {MyPoemsListComponent} from './my-poems-list.component';

describe('MyPoemsListComponent', () => {
  let backendServiceStub: BackendServiceStub;
  let component: MyPoemsListComponent;
  let fixture: ComponentFixture<MyPoemsListComponent>;
  let loader: HarnessLoader;
  let dialog: MatDialog;

  beforeEach(async () => {
    backendServiceStub = new BackendServiceStub();

    await TestBed
        .configureTestingModule({
          imports: [
            CommonModule,
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
    dialog = TestBed.inject(MatDialog);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    backendServiceStub.getManualPoems();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a new poem dialog', () => {
    // Spy on the dialog's open call
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
    let expectedPoemsResponse =
        await firstValueFrom(backendServiceStub._getManualPoemsRequest());

    // Check that there is one card for each poem
    expect(myPoemCards.length).toEqual(expectedPoemsResponse.poems.length);

    // Add a new manual poem and check again
    backendServiceStub.createPoem('new manual poem', 'some test text', false);
    myPoemCards = await loader.getAllHarnesses(
        MatCardHarness.with({selector: '.my-poem-card'}));
    expectedPoemsResponse =
        await firstValueFrom(backendServiceStub._getManualPoemsRequest());

    // Check that there is one card for each manual poem including the new one
    expect(myPoemCards.length).toEqual(expectedPoemsResponse.poems.length);

    // Check the card contents
    for (let i = 0; i < myPoemCards.length; i++) {
      const card = myPoemCards[i];
      const poem = expectedPoemsResponse.poems[i];

      expect(await card.getTitleText()).toContain(poem.name);
      expect(await card.getText()).toContain(poem.text);
    }
  });

  it('should open the edit dialog', async () => {
    const manualPoemsResponse =
        await firstValueFrom(backendServiceStub._getManualPoemsRequest());
    const testPoem = manualPoemsResponse.poems[0];

    // Spy on the dialog's open call
    const dialogOpenSpy = spyOn(dialog, 'open');

    const editPoemButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.edit-poem'}));
    await editPoemButton.click();

    // Check that the dialog open was called
    expect(dialog.open).toHaveBeenCalled();
    const dialogOpenSpyArgs = dialogOpenSpy.calls.mostRecent().args;
    expect(dialogOpenSpyArgs[0]).toBe(MyPoemsEditDialog);

    if (!dialogOpenSpyArgs[1]) {
      throw new Error('Failed to find second argument for dialog open');
    }
    const dialogPoem = dialogOpenSpyArgs[1].data as Poem;
    expect(dialogPoem.name).toContain(testPoem.name);
    expect(dialogPoem.text).toContain(testPoem.text);
  });
});
