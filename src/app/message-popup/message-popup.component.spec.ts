import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_SNACK_BAR_DATA, MatSnackBarModule} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';

import {MessagePopup} from './message-popup.component';

describe('MessagePopupComponent', () => {
  let component: MessagePopup;
  let fixture: ComponentFixture<MessagePopup>;
  let loader: HarnessLoader;
  let popupMessageSubject: Subject<string>;

  beforeEach(async () => {
    popupMessageSubject = new Subject<string>();

    await TestBed
        .configureTestingModule({
          declarations: [MessagePopup],
          imports: [
            CommonModule,
            MatSnackBarModule,
          ],
          providers: [{
            provide: MAT_SNACK_BAR_DATA,
            useValue: popupMessageSubject.asObservable()
          }]
        })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagePopup);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a message from the data observable', () => {
    // Before the message observable resolves, it should display a loading
    // message
    let messageTextElement =
        fixture.nativeElement.querySelector('.message-text');
    expect(messageTextElement.textContent).toContain('Loading');

    // After the  message observable resolves, the text should change
    const testText = 'test';
    popupMessageSubject.next(testText);
    fixture.detectChanges();

    messageTextElement = fixture.nativeElement.querySelector('.message-text');
    expect(messageTextElement.textContent).toContain(testText);
  });
});
