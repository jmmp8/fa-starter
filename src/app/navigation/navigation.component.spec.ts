import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Location} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {routes} from '../app-routing.module';
import {AuthService} from '../auth.service';
import {AuthServiceStub} from '../testing/auth-service-stub';

import {NavigationComponent} from './navigation.component';

describe('NavigationComponent', () => {
  let authServiceStub: AuthServiceStub;
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let loader: HarnessLoader;
  let location: Location;
  let router: Router;

  beforeEach(async () => {
    authServiceStub = new AuthServiceStub();

    await TestBed
        .configureTestingModule({
          imports: [
            MatButtonModule,
            RouterTestingModule.withRoutes(routes),
          ],
          declarations: [NavigationComponent],
          providers: [{provide: AuthService, useValue: authServiceStub}],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the My Poems link if the user is not logged in',
     async () => {
       const myPoemsNavButton = await loader.getHarness(
           MatButtonHarness.with({selector: '.my-poems-nav'}));

       // Initially should not be disabled since the
       // auth stub starts with a user
       expect(await myPoemsNavButton.isDisabled()).toBeFalse();

       authServiceStub.clearUser();
       fixture.detectChanges();

       expect(await myPoemsNavButton.isDisabled()).toBeTrue();
     });

  it('should navigate to the My Poems page', async () => {
    const expectedRoute = '/my_poems';

    const myPoemsNavButton = await loader.getHarness(
        MatButtonHarness.with({selector: '.my-poems-nav'}));
    expect(component.getButtonColor(expectedRoute)).toBe('basic');
    await myPoemsNavButton.click();

    fixture.detectChanges();
    expect(location.path()).toBe(expectedRoute);
    expect(component.getButtonColor(expectedRoute)).toBe('primary');
  });

  it('should navigate to the Home page', async () => {
    const expectedRoute = '/home';

    // Default is home page, first navigate off
    await router.navigate(['/my_poems']);
    expect(location.path()).toBe('/my_poems');

    const homeNavButton =
        await loader.getHarness(MatButtonHarness.with({selector: '.home-nav'}));
    expect(component.getButtonColor(expectedRoute)).toBe('basic');
    await homeNavButton.click();

    fixture.detectChanges();
    expect(location.path()).toBe(expectedRoute);
    expect(component.getButtonColor(expectedRoute)).toBe('primary');
  });
});
