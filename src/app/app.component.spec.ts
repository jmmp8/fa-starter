import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {AppComponent} from './app.component';
import {AuthService} from './auth.service';
import {BackendService} from './backend.service';
import {LoginButtonComponent} from './login-button/login-button.component';
import {AuthServiceStub} from './testing/auth-service-stub';
import {BackendServiceStub} from './testing/backend-service-stub';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            AppComponent,
            LoginButtonComponent,
          ],
          providers: [
            {provide: AuthService, useValue: new AuthServiceStub()},
            {provide: BackendService, useValue: new BackendServiceStub()},
          ],
        })
        .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
