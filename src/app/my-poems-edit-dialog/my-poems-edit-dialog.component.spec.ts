import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {firstValueFrom, of} from 'rxjs';

import {BackendService} from '../backend.service';
import {Poem} from '../backend_response_types';
import {MessagePopup} from '../message-popup/message-popup.component';
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
          declarations: [
            MessagePopup,
            MyPoemsEditDialog,
          ],
          imports: [
            BrowserAnimationsModule,
            CommonModule,
            FormsModule,
            MatButtonModule,
            MatFormFieldModule,
            MatInputModule,
            MatSnackBarModule,
          ],
          providers: [
            {provide: BackendService, useValue: backendServiceStub},
            {provide: MatDialogRef, useValue: {close: (_: any) => null}},
            {provide: MAT_DIALOG_DATA, useValue: undefined},
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

  it('should create the poem if Submit is clicked', async () => {
    const testName = 'testName';
    const testPoem = 'testPoem';

    // Set up spy on dialog box
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = spyOn(snackBar, 'openFromComponent');

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

    const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpyArgs[0]).toBe(MessagePopup);

    if (!snackBarSpyArgs[1])
      throw new Error('Failed to find second argument for popup message');
    expect(await firstValueFrom(snackBarSpyArgs[1].data))
        .toContain('Poem Created!');
  });

  it('should send an error message if the poem creation fails', async () => {
    // Spy on the backend service's createPoem and make sure it returns an error
    // value
    spyOn(backendServiceStub, 'createPoem').and.returnValue(of(undefined));

    const testName = 'testName';
    const testPoem = 'testPoem';

    // Set up spy on dialog box
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = spyOn(snackBar, 'openFromComponent');

    // Simulate the poem submission
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

    const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpyArgs[0]).toBe(MessagePopup);

    if (!snackBarSpyArgs[1])
      throw new Error('Failed to find second argument for popup message');
    expect(await firstValueFrom(snackBarSpyArgs[1].data))
        .toContain('Failed to create poem.');
  });
});


describe('MyPoemsEditDialog with data', () => {
  let backendServiceStub: BackendServiceStub;
  let component: MyPoemsEditDialog;
  let fixture: ComponentFixture<MyPoemsEditDialog>;
  let loader: HarnessLoader;
  let testPoem: Poem;

  beforeEach(async () => {
    backendServiceStub = new BackendServiceStub();
    testPoem = Object.assign({}, backendServiceStub.poem[0]);

    await TestBed
        .configureTestingModule({
          declarations: [
            MessagePopup,
            MyPoemsEditDialog,
          ],
          imports: [
            BrowserAnimationsModule,
            CommonModule,
            FormsModule,
            MatButtonModule,
            MatFormFieldModule,
            MatInputModule,
            MatSnackBarModule,
          ],
          providers: [
            {provide: BackendService, useValue: backendServiceStub},
            {provide: MatDialogRef, useValue: {close: (_: any) => null}},
            {provide: MAT_DIALOG_DATA, useValue: testPoem},
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

  it('should populate the input fields with poem data', async () => {
    const poemNameField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-name-field'}));
    const poemTextField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-text-field'}));

    expect(await poemNameField.getValue()).toContain(testPoem.name);
    expect(await poemTextField.getValue()).toContain(testPoem.text);
  });

  it('should edit the poem if Submit is clicked', async () => {
    const newName = testPoem.name + 'EDITED';
    const newText = testPoem.text + 'EDITED';

    const editedPoem = Object.assign({}, testPoem);
    editedPoem.name = newName;
    editedPoem.text = newText;

    // Set up spy on dialog box
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = spyOn(snackBar, 'openFromComponent');

    // Set up backend service spy
    const spyResponse = backendServiceStub.editPoem(editedPoem);
    const editPoemSpy =
        spyOn(backendServiceStub, 'editPoem').and.returnValue(spyResponse);

    const submitButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.poem-edit-submit'}));
    const poemNameField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-name-field'}));
    const poemTextField = await loader.getHarness(
        MatInputHarness.with({selector: '.poem-text-field'}));

    await poemNameField.setValue(newName);
    await poemTextField.setValue(newText);
    await submitButton.click();

    expect(editPoemSpy).toHaveBeenCalled();
    const editPoemArgs = editPoemSpy.calls.mostRecent().args;
    expect(editPoemArgs[0].name).toEqual(newName);
    expect(editPoemArgs[0].text).toEqual(newText);

    const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpyArgs[0]).toBe(MessagePopup);

    if (!snackBarSpyArgs[1])
      throw new Error('Failed to find second argument for popup message');
    expect(await firstValueFrom(snackBarSpyArgs[1].data))
        .toContain('Poem edit complete.');
  });

  it('should send an error message if the poem editing fails', async () => {
    // Spy on the backend service's editPoem and make sure it returns an error
    // value
    spyOn(backendServiceStub, 'editPoem').and.returnValue(of(undefined));

    // Set up spy on dialog box
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = spyOn(snackBar, 'openFromComponent');

    // Simulate the poem submission
    const submitButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.poem-edit-submit'}));
    await submitButton.click();

    expect(backendServiceStub.editPoem).toHaveBeenCalled();

    const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpyArgs[0]).toBe(MessagePopup);

    if (!snackBarSpyArgs[1])
      throw new Error('Failed to find second argument for popup message');
    expect(await firstValueFrom(snackBarSpyArgs[1].data))
        .toContain('Failed to edit poem.');
  });
});
