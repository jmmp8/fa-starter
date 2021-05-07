import {Location} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {routes} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthService} from './auth.service';
import {BackendService} from './backend.service';
import {LoginButtonComponent} from './login-button/login-button.component';
import {NavigationComponent} from './navigation/navigation.component';
import {AuthServiceStub} from './testing/auth-service-stub';
import {BackendServiceStub} from './testing/backend-service-stub';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    TestBed
        .configureTestingModule({
          imports: [
            MatDividerModule,
            MatButtonModule,
            RouterTestingModule.withRoutes(routes),
          ],
          declarations: [
            AppComponent,
            LoginButtonComponent,
            NavigationComponent,
          ],
          providers: [
            {provide: AuthService, useValue: new AuthServiceStub()},
            {provide: BackendService, useValue: new BackendServiceStub()},
          ],
        })
        .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should default to the home page', () => {
    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/home/');
  });
});
