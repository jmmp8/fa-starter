import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';

import {AuthService} from '../auth.service';
import {AuthServiceStub} from '../testing/auth-service-stub';

import {LoginButtonComponent} from './login-button.component';

describe('LoginButtonComponent', () => {
  let authServiceStub: AuthServiceStub;
  let compiled: HTMLElement;
  let component: LoginButtonComponent;
  let fixture: ComponentFixture<LoginButtonComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    authServiceStub = new AuthServiceStub();

    await TestBed
        .configureTestingModule({
          imports: [
            MatButtonModule,
          ],
          declarations: [LoginButtonComponent],
          providers: [{provide: AuthService, useValue: authServiceStub}],
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
    expect(await logInButton.getText()).toContain('Log Out');

    const emailLabel = compiled.querySelector('.user-email-label');
    if (!emailLabel) throw new Error('Failed to find user email label');
    const expectedEmail = authServiceStub.getUserEmail();
    expect(emailLabel.textContent).toContain(expectedEmail);
  });

  it('should show a login button if the user is not logged in', async () => {
    authServiceStub.user = null;
    fixture.detectChanges();

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    expect(await logInButton.getText()).toContain('Log In');
  });

  it('should attempt to log in or out when the button is clicked', async () => {
    spyOn(authServiceStub, 'logInOrOut');

    const logInButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.login-button'}));
    await logInButton.click();

    expect(authServiceStub.logInOrOut).toHaveBeenCalled();
  });
});
