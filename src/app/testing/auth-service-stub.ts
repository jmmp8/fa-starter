export class AuthServiceStub {
  user: string|null = 'test_user@test.com';

  async logInOrOut(): Promise<void> {}

  getUserEmail(): string|null {
    return this.user;
  }
}
