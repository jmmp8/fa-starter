import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressSpinnerHarness} from '@angular/material/progress-spinner/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {firstValueFrom, of} from 'rxjs';

import {AuthService} from '../auth.service';
import {BackendService} from '../backend.service';
import {MessagePopup} from '../message-popup/message-popup.component';
import {AuthServiceStub} from '../testing/auth-service-stub';
import {BackendServiceStub} from '../testing/backend-service-stub';

import {LoginButtonComponent} from './login-button.component';

describe('LoginButtonComponent', () => {
  let authServiceStub: AuthServiceStub;
  let backendServiceStub: BackendServiceStub;
  let compiled: HTMLElement;
  let component: LoginButtonComponent;
  let fixture: ComponentFixture<LoginButtonComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    authServiceStub = new AuthServiceStub();
    backendServiceStub = new BackendServiceStub();

    await TestBed
        .configureTestingModule({
          imports: [
            BrowserAnimationsModule,
            CommonModule,
            MatButtonModule,
            MatProgressSpinnerModule,
            MatSnackBarModule,
          ],
          declarations: [
            LoginButtonComponent,
            MessagePopup,
          ],
          providers: [
            {provide: AuthService, useValue: authServiceStub},
            {provide: BackendService, useValue: backendServiceStub},
          ],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginButtonComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a log out button and display the user\'s email', async () => {
    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    expect(await logInButton.getText()).toContain('Sign Out');

    const emailLabel = compiled.querySelector('.user-email-label');
    if (!emailLabel) throw new Error('Failed to find user email label');
    const expectedEmail = authServiceStub.getUserEmail();
    expect(emailLabel.textContent).toContain(expectedEmail);
    expect(component.getUserEmail()).toContain(expectedEmail);
  });

  it('should show a login button if the user is not logged in', async () => {
    authServiceStub.clearUser();
    fixture.detectChanges();

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    expect(await logInButton.getText()).toContain('Sign In with Google');
    expect(component.getUserEmail()).toBeUndefined();
  });

  it('should attempt to log in when the button is clicked', async () => {
    authServiceStub.clearUser();

    spyOn(authServiceStub, 'logIn');
    spyOn(authServiceStub, 'logOut');

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    await logInButton.click();

    expect(authServiceStub.logIn).toHaveBeenCalled();
    expect(authServiceStub.logOut).not.toHaveBeenCalled();
  });

  it('should attempt to log out when the button is clicked and the user is already logged in',
     async () => {
       spyOn(authServiceStub, 'logIn');
       spyOn(authServiceStub, 'logOut');

       const logInButton = await loader.getHarness(
           MatButtonHarness.with({selector: '.login-button'}));
       await logInButton.click();

       expect(authServiceStub.logIn).not.toHaveBeenCalled();
       expect(authServiceStub.logOut).toHaveBeenCalled();
     });

  it('should call the backend to create a User', async () => {
    const expectedEmail = authServiceStub.getUserEmail();
    if (!expectedEmail)
      throw new Error('Auth service stub did not have an email configured');
    authServiceStub.clearUser();

    // Set up spies on dialog box and backend service
    const snackBar = TestBed.inject(MatSnackBar);
    const snackBarSpy = spyOn(snackBar, 'openFromComponent');

    const spyResponse = backendServiceStub.createUser(expectedEmail);
    spyOn(backendServiceStub, 'createUser').and.returnValue(spyResponse);

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    await logInButton.click();

    expect(backendServiceStub.createUser)
        .toHaveBeenCalledOnceWith(expectedEmail);

    // Check that the snackBar was called correctly
    const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpyArgs[0]).toBe(MessagePopup);

    if (!snackBarSpyArgs[1])
      throw new Error('Failed to find second argument for popup message');
    expect(await firstValueFrom(snackBarSpyArgs[1].data))
        .toContain('Your user has been created.');
  });

  it('should confirm the user\'s existance if they have logged in before',
     async () => {
       // Use an already existing email
       const expectedEmail = backendServiceStub.user[0].email;
       if (!expectedEmail)
         throw new Error('Auth service stub did not have an email configured');
       authServiceStub.clearUser();

       // Set up spies on dialog box and backend service
       const snackBar = TestBed.inject(MatSnackBar);
       const snackBarSpy = spyOn(snackBar, 'openFromComponent');

       const spyResponse = backendServiceStub.createUser(expectedEmail);
       spyOn(backendServiceStub, 'createUser').and.returnValue(spyResponse);

       const logInButton = await loader.getHarness(
           MatButtonHarness.with({selector: '.login-button'}));
       await logInButton.click();

       expect(backendServiceStub.createUser).toHaveBeenCalled();

       // Check that the snackBar was called correctly
       const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
       expect(snackBarSpy).toHaveBeenCalled();
       expect(snackBarSpyArgs[0]).toBe(MessagePopup);

       if (!snackBarSpyArgs[1])
         throw new Error('Failed to find second argument for popup message');
       expect(await firstValueFrom(snackBarSpyArgs[1].data))
           .toContain('Sign on successful.');
     });

  it('should show a spinner while login is in progress', async () => {
    component.isLoggingIn = true;
    const spinner = await loader.getHarness(
        MatProgressSpinnerHarness.with({selector: '.login-spinner'}));
    expect(spinner).toBeDefined();
  });

  it('should show a failure message if the backend returns an error',
     async () => {
       const expectedEmail = authServiceStub.getUserEmail();
       if (!expectedEmail)
         throw new Error('Auth service stub did not have an email configured');
       authServiceStub.clearUser();

       // Set up spies on dialog box and backend service
       const snackBar = TestBed.inject(MatSnackBar);
       const snackBarSpy = spyOn(snackBar, 'openFromComponent');

       spyOn(backendServiceStub, 'createUser').and.returnValue(of(undefined));

       const logInButton = await loader.getHarness(
           MatButtonHarness.with({selector: '.login-button'}));
       await logInButton.click();

       expect(backendServiceStub.createUser)
           .toHaveBeenCalledOnceWith(expectedEmail);

       // Check that the snackBar was called correctly
       const snackBarSpyArgs = snackBarSpy.calls.mostRecent().args;
       expect(snackBarSpy).toHaveBeenCalled();
       expect(snackBarSpyArgs[0]).toBe(MessagePopup);

       if (!snackBarSpyArgs[1])
         throw new Error('Failed to find second argument for popup message');
       expect(await firstValueFrom(snackBarSpyArgs[1].data))
           .toContain('Server communication failed.');
     });
});
