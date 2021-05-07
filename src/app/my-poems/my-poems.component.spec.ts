import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MyPoemsComponent} from './my-poems.component';

describe('MyPoemsComponent', () => {
  let component: MyPoemsComponent;
  let fixture: ComponentFixture<MyPoemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({declarations: [MyPoemsComponent]})
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
