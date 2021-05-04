/* eslint-disable @typescript-eslint/no-empty-function */
import {BaseAuthService} from '../auth.service';

export class AuthServiceStub extends BaseAuthService {
  protected user?: string = 'test_user@test.com';

  clearUser() {
    this.user = undefined;
  }

  setUser(userEmail: string) {
    this.user = userEmail;
  }

  async logIn(): Promise<void> {}
  async logOut(): Promise<void> {}

  getUserEmail(): string|undefined {
    return this.user;
  }
}
