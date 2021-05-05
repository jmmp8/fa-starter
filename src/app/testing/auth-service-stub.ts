/* eslint-disable @typescript-eslint/no-empty-function */
import {BaseAuthService} from '../auth.service';

export class AuthServiceStub extends BaseAuthService {
  private testUser = 'test_user@test.com';
  protected user?: string = this.testUser;

  clearUser(): void {
    this.user = undefined;
  }

  setUser(userEmail: string): void {
    this.user = userEmail;
  }

  async logIn(): Promise<void> {
    this.setUser(this.testUser);
  }

  async logOut(): Promise<void> {
    this.clearUser();
  }

  getUserEmail(): string|undefined {
    return this.user;
  }
}
