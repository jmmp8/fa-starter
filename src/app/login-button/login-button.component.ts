import {Component, OnInit} from '@angular/core';
import {g_client_id} from '../../client_id';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css']
})
export class LoginButtonComponent implements OnInit {
  gapiSetup = false;
  authInstance: gapi.auth2.GoogleAuth;
  user?: gapi.auth2.GoogleUser;
  error: any;

  constructor() {}

  ngOnInit(): void {
    this.initGoogleAuth();
  }

  async initGoogleAuth(): Promise<void> {
    const pload = new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });

    return pload.then(async () => {
      await gapi.auth2.init({client_id: g_client_id}).then(auth => {
        this.gapiSetup = true;
        this.authInstance = auth;
      });
    });
  }

  async logInOrOut(): Promise<void> {
    if (this.user) {
      await this.logOut();
    } else {
      await this.logIn();
    }
  }

  async logIn(): Promise<gapi.auth2.GoogleUser> {
    return new Promise(
        async () => {await this.authInstance.signIn().then(
            user => this.user = user,
            error => this.error = error,
            )});
  }

  async logOut(): Promise<void> {
    await this.authInstance.signOut().then(() => this.user = undefined);
  }

  getUserEmail(): string|null {
    if (this.user) {
      let profile = this.user.getBasicProfile();
      return profile.getEmail();
    } else {
      return null;
    }
  }
}
