import {Component} from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css']
})
export class LoginButtonComponent {
  constructor(private authService: AuthService) {}

  logInOrOut(): void {
    this.authService.logInOrOut();
  }

  getUserEmail(): string|null {
    return this.authService.getUserEmail();
  }
}
