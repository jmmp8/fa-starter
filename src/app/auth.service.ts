import {Injectable} from '@angular/core';
import {g_client_id} from '../client_id';

@Injectable({providedIn: 'root'})
export class AuthService {
  private authInstance: gapi.auth2.GoogleAuth;
  private user?: gapi.auth2.GoogleUser;

  constructor() {
    this.initGoogleAuth();
  }

  async initGoogleAuth(): Promise<void> {
    const pload = new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });

    return pload.then(async () => {
      await gapi.auth2.init({client_id: g_client_id}).then(auth => {
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

  private async logIn(): Promise<void> {
    this.user = await this.authInstance.signIn();
  }

  private async logOut(): Promise<void> {
    await this.authInstance.signOut();
    this.user = undefined;
  }

  getUserEmail(): string|null {
    if (this.user) {
      const profile = this.user.getBasicProfile();
      return profile.getEmail();
    } else {
      return null;
    }
  }
}
