import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatGridListModule} from '@angular/material/grid-list';

import {MyPoemsComponent} from './my-poems.component';

describe('MyPoemsComponent', () => {
  let component: MyPoemsComponent;
  let fixture: ComponentFixture<MyPoemsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [
            MatGridListModule,
          ],
          declarations: [MyPoemsComponent],
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
