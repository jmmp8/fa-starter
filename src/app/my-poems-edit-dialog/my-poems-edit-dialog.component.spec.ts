import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatInputHarness} from '@angular/material/input/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';

import {BackendService} from '../backend.service';
import {BackendServiceStub} from '../testing/backend-service-stub';

import {MyPoemsEditDialog} from './my-poems-edit-dialog.component';

describe('MyPoemsEditDialog', () => {
  let backendServiceStub: BackendServiceStub;
  let component: MyPoemsEditDialog;
  let fixture: ComponentFixture<MyPoemsEditDialog>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    backendServiceStub = new BackendServiceStub();

    await TestBed
        .configureTestingModule({
          declarations: [MyPoemsEditDialog],
          imports: [
            BrowserAnimationsModule,
            FormsModule,
            MatButtonModule,
            MatFormFieldModule,
            MatInputModule,
          ],
          providers: [
            {provide: BackendService, useValue: backendServiceStub},
            {provide: MatDialogRef, useValue: {close: (_: any) => null}},
            {provide: MAT_DIALOG_DATA, useValue: {}},
          ],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsEditDialog);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the Submit button unless all fields are supplied',
     async () => {
       const submitButton = await loader.getHarness(
           MatButtonHarness.with({selector: '.poem-edit-submit'}));
       const poemNameField = await loader.getHarness(
           MatInputHarness.with({selector: '.poem-name-field'}));
       const poemTextField = await loader.getHarness(
           MatInputHarness.with({selector: '.poem-text-field'}));

       // No inputs, button should be disabled
       expect(await submitButton.isDisabled()).toBeTrue();

       // Either one field has value, should be disabled
       await poemNameField.setValue('test');
       expect(await submitButton.isDisabled()).toBeTrue();

       await poemNameField.setValue('');
       await poemTextField.setValue('test');
       expect(await submitButton.isDisabled()).toBeTrue();

       // Both fields have value, should not be disabled
       await poemNameField.setValue('test');
       expect(await submitButton.isDisabled()).toBeFalse();
     });

  it('should not create the poem if Cancel is clicked', async () => {
    // Set up backend service spy
    const spyResponse = backendServiceStub.createPoem('test', 'test', false);
    spyOn(backendServiceStub, 'createPoem').and.returnValue(spyResponse);

    const cancelButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.poem-edit-cancel'}));
    await cancelButton.click();

    expect(backendServiceStub.createPoem).not.toHaveBeenCalled();
  });

  it('should should create the poem if Submit is clicked', async () => {
    const testName = 'testName';
    const testPoem = 'testPoem';

    // Set up backend service spy
    const spyResponse =
        backendServiceStub.createPoem(testName, testPoem, false);
    spyOn(backendServiceStub, 'createPoem').and.returnValue(spyResponse);

    const submitButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.poem-edit-submit'}));
    const poemNameField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-name-field'}));
    const poemTextField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-text-field'}));

    await poemNameField.setValue(testName);
    await poemTextField.setValue(testPoem);
    await submitButton.click();

    expect(backendServiceStub.createPoem)
        .toHaveBeenCalledWith(testName, testPoem, false);
  });
});
