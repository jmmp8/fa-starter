import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPoemsEditDialogComponent } from './my-poems-edit-dialog.component';

describe('MyPoemsEditDialogComponent', () => {
  let component: MyPoemsEditDialogComponent;
  let fixture: ComponentFixture<MyPoemsEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPoemsEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPoemsEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
