import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, tap} from 'rxjs/operators';
import {AuthService} from '../auth.service';
import {BackendService} from '../backend.service';
import {MessagePopup} from '../message-popup/message-popup.component';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css']
})
export class LoginButtonComponent {
  isLoggingIn: boolean;

  constructor(
      private authService: AuthService,
      private backendService: BackendService,
      private snackBar: MatSnackBar,
  ) {}

  async logInOrOut(): Promise<void> {
    await this.authService.logInOrOut();

    const userEmail = this.getUserEmail();
    if (userEmail) {
      this.isLoggingIn = true;

      this.snackBar.openFromComponent(
          MessagePopup,
          {
            data: this.backendService.createUser(userEmail).pipe(
                tap(_ => this.isLoggingIn = false),
                map((response) => {
                  if (response) {
                    return response.created ? 'Your user has been created.' :
                                              'Sign on successful.';
                  } else {
                    this.authService.logOut();
                    return 'Server communication failed.';
                  }
                }),
                )
          },
      );
    }
  }

  getUserEmail(): string|undefined {
    return this.authService.getUserEmail();
  }
}
