import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MyPoemsListComponent} from '../my-poems-list/my-poems-list.component';

import {MyPoemsComponent} from './my-poems.component';

describe('MyPoemsComponent', () => {
  let compiled: HTMLElement;
  let component: MyPoemsComponent;
  let fixture: ComponentFixture<MyPoemsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [
            MatCardModule,
            MatDialogModule,
            MatGridListModule,
          ],
          declarations: [
            MyPoemsComponent,
            MyPoemsListComponent,
          ],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsComponent);
    compiled = fixture.nativeElement;
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a my poems list component', () => {
    const myPoemsList = compiled.querySelector('app-my-poems-list');
    expect(myPoemsList).toBeTruthy();
  });
});
