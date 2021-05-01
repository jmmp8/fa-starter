import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AuthService} from '../auth.service';
import {AuthServiceStub} from '../testing/auth-service-stub';

import {LoginButtonComponent} from './login-button.component';

describe('LoginButtonComponent', () => {
  let authServiceStub: AuthServiceStub;
  let compiled: HTMLElement;
  let component: LoginButtonComponent;
  let fixture: ComponentFixture<LoginButtonComponent>;


  beforeEach(async () => {
    authServiceStub = new AuthServiceStub();

    await TestBed
        .configureTestingModule({
          declarations: [LoginButtonComponent],
          providers: [{provide: AuthService, useValue: authServiceStub}],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginButtonComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a log out button and display the user\'s email', () => {
    const logInButton = compiled.querySelector('.login-button');
    if (!logInButton) throw new Error('Failed to find log in button');
    expect(logInButton.textContent).toContain('Log Out');

    const emailLabel = compiled.querySelector('.user-email-label');
    if (!emailLabel) throw new Error('Failed to find user email label');
    let expectedEmail = authServiceStub.getUserEmail();
    expect(emailLabel.textContent).toContain(expectedEmail);
  });

  it('should show a login button if the user is not logged in', () => {
    authServiceStub.user = null;
    fixture.detectChanges();

    const logInButton = compiled.querySelector('.login-button');
    if (!logInButton) throw new Error('Failed to find log in button');

    expect(logInButton.textContent).toContain('Log In');
  })
});
