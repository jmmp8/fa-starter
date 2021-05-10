import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPoemsListComponent } from './my-poems-list.component';

describe('MyPoemsListComponent', () => {
  let component: MyPoemsListComponent;
  let fixture: ComponentFixture<MyPoemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPoemsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
