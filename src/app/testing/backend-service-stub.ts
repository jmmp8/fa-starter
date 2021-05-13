/* eslint-disable @typescript-eslint/no-empty-function */
import {Observable, of} from 'rxjs';
import {BaseBackendService} from '../backend.service';
import {CreateUserResponse, User} from '../backend_response_types';

export class BackendServiceStub extends BaseBackendService {
  /* These properties replace the actual database tables for testing */
  user: User[];

  constructor() {
    super();

    // Initialize fake tables with testing data
    this.user = [{'id': 1, 'email': 'user@gmail.com'}];
  }

  createUser(email: string): Observable<CreateUserResponse> {
    let created = false;
    let userRow: User|undefined =
        this.user.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userRow) {
      created = true;
      userRow = {
        'id': Math.max(...this.user.map(u => u.id)) + 1,
        'email': email,
      };
      this.user.push(userRow);
    }

    return of({
      'created': created,
      'user': {
        'id': userRow.id,
        'email': userRow.email,
      }
    });
  }

  createPoem(poemName: string, poemText: string, generated: boolean) {
    // Not yet implemented
  }
}
