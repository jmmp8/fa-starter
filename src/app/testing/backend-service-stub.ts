/* eslint-disable @typescript-eslint/no-empty-function */
import {Observable, of} from 'rxjs';
import {BaseBackendService} from '../backend.service';
import {CreatePoemResponse, CreateUserResponse, GetPoemsResponse, Poem, PoemForm, PoemPrivacyLevel, User} from '../backend_response_types';

export class BackendServiceStub extends BaseBackendService {
  /* These properties replace the actual database tables for testing */
  user: User[];
  poem: Poem[];

  constructor() {
    super();

    // Initialize fake tables with testing data
    this.user = [{'id': 1, 'email': 'user@gmail.com'}];
    this.poem = [];
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

  createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse> {
    if (!this.user.length) {
      throw new Error('No user to create poem for');
    }

    const newPoem: Poem = {
      'id': Math.max(...this.poem.map(p => p.id)) + 1,
      'user_id': this.user[0].id,
      'creation_timestamp': new Date(),
      'modified_timestamp': null,
      'privacy_level': PoemPrivacyLevel.Public,
      'archived': true,
      'form': null,
      'generated': generated,
      'name': poemName,
      'text': poemText,
      'num_likes': 0,
      'num_dislikes': 0,
    };

    this.poem.push(newPoem);

    return of({
      'created': true,
      'poem': newPoem,
    });
  }

  getManualPoems(numPoems = 0): void {
    // Sort the poems by modified timestamp or creation timestamp if no modified
    // timestamp exists
    const getSortValue = function(p: Poem) {
      if (p.modified_timestamp) {
        return p.modified_timestamp.getTime();
      } else if (p.creation_timestamp) {
        return p.creation_timestamp.getTime();
      } else {
        return 0;
      }
    };

    // Retrieve manually written poems, sorted by timestamp, limited to numPoems
    // entries
    const manualPoems =
        this.poem
            .filter(
                poem => !poem.generated && (poem.user_id == this.user[0].id))
            .sort((a, b) => getSortValue(b) - getSortValue(a))
            .slice(numPoems);

    // Send the response to the manual poems subject
    const response: GetPoemsResponse = {type: 'manual', poems: manualPoems};
    this.manualPoemsSubject.next(of(response));
  }
}
