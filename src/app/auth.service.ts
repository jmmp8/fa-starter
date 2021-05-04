import {Injectable} from '@angular/core';
import {g_client_id} from '../client_id';

@Injectable({providedIn: 'root'})
export abstract class BaseAuthService {
  protected user?: gapi.auth2.GoogleUser|string;

  async logInOrOut(): Promise<void> {
    if (this.user) {
      await this.logOut();
    } else {
      await this.logIn();
    }
  }

  protected abstract logIn(): Promise<void>;
  protected abstract logOut(): Promise<void>;

  abstract getUserEmail(): string|undefined;
}

@Injectable({providedIn: 'root'})
export class AuthService extends BaseAuthService {
  private authInstance: gapi.auth2.GoogleAuth;
  protected user?: gapi.auth2.GoogleUser;

  constructor() {
    super();
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

  async logIn(): Promise<void> {
    this.user = await this.authInstance.signIn();
  }

  async logOut(): Promise<void> {
    await this.authInstance.signOut();
    this.user = undefined;
  }

  getUserEmail(): string|undefined {
    if (this.user) {
      const profile = this.user.getBasicProfile();
      return profile.getEmail();
    } else {
      return undefined;
    }
  }
}
