import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {AppComponent} from './app.component';
import {AuthService} from './auth.service';
import {LoginButtonComponent} from './login-button/login-button.component';
import {AuthServiceStub} from './testing/auth-service-stub';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            AppComponent,
            LoginButtonComponent,
          ],
          providers: [{provide: AuthService, useValue: new AuthServiceStub()}],
        })
        .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
