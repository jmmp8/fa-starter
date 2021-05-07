import {Component} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../auth.service';
import {BackendService} from '../backend.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css']
})
export class LoginButtonComponent {
  constructor(
      private authService: AuthService,
      private backendService: BackendService,
  ) {}

  async logInOrOut(): Promise<void> {
    await this.authService.logInOrOut();

    const userEmail = this.getUserEmail();
    if (userEmail) {
      const response =
          await firstValueFrom(this.backendService.createUser(userEmail));

      if (!response) {
        console.error(
            'Failed to get a response from the backend for creating a user');
      } else {
        console.log(response);
      }
    }
  }

  getUserEmail(): string|undefined {
    return this.authService.getUserEmail();
  }
}
