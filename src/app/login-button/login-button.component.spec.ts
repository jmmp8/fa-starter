import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressSpinnerHarness} from '@angular/material/progress-spinner/testing';

import {AuthService} from '../auth.service';
import {BackendService} from '../backend.service';
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
            MatButtonModule,
            MatProgressSpinnerModule,
          ],
          declarations: [LoginButtonComponent],
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
    spyOn(backendServiceStub, 'createUser');

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    await logInButton.click();

    expect(backendServiceStub.createUser)
        .toHaveBeenCalledOnceWith(expectedEmail);
  });

  it('should show a spinner while login is in progress', async () => {
    component.isLoggingIn = true;
    const spinner = await loader.getHarness(
        MatProgressSpinnerHarness.with({selector: '.login-spinner'}));
    expect(spinner).toBeDefined();
  });
});
