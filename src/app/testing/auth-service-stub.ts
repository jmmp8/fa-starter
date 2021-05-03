/* eslint-disable @typescript-eslint/no-empty-function */
export class AuthServiceStub {
  user: string|undefined = 'test_user@test.com';

  async logInOrOut(): Promise<void> {
    if (this.user) {
      await this.logOut();
    } else {
      await this.logIn();
    }
  }

  async logIn(): Promise<void> {}

  async logOut(): Promise<void> {}

  getUserEmail(): string|undefined {
    return this.user;
  }
}
