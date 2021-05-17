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
    this.user = [{'id': 1, 'email': 'test_user@gmail.com'}];
    this.poem = [{
      'id': 1,
      'user_id': this.user[0].id,
      'creation_timestamp': new Date(),
      'modified_timestamp': null,
      'privacy_level': PoemPrivacyLevel.Public,
      'archived': true,
      'form': null,
      'generated': false,
      'name': 'test poem',
      'text': 'test\ntext',
      'num_likes': 0,
      'num_dislikes': 0,
    }];
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
      Observable<CreatePoemResponse|undefined> {
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

    this.refreshManualPoems();

    return of({
      'created': true,
      'poem': newPoem,
    });
  }

  /**
   * Test version of the backend service's _getPoemsResponse.
   * Includes a few additional parameters and a return value to help testing
   *
   * @param {string} poemType - one of 'best', 'new', 'manual', 'liked',
   *     'generated'. Currently only manual is implemented
   * @param {number} numPoems - The maximum number of poems to retrieve
   * @param {number} userId - If supplied, which user to get poems for. Defaults
   *     to the test user
   *
   * @returns {Observable<GetPoemsResponse>} - The list of manually written
   *     poems that match the userId, up to numPeoms are returned
   */
  _getPoemsRequest(poemType: string, numPeoms: number, userId?: number):
      Observable<GetPoemsResponse> {
    if (poemType == 'manual') {
      return this._getManualPoemsRequest(0, userId);
    } else {
      throw new Error('Other poem types not yet implemented');
    }
  }

  _getManualPoemsRequest(numPoems = 0, userId?: number):
      Observable<GetPoemsResponse> {
    // Sort the poems by modified timestamp or creation timestamp if no modified
    // timestamp exists
    const getSortValue = (p: Poem) => {
      if (p.modified_timestamp) {
        return p.modified_timestamp.getTime();
      } else if (p.creation_timestamp) {
        return p.creation_timestamp.getTime();
      } else {
        return 0;
      }
    };

    if (userId == undefined) {
      userId = this.user[0].id;
    }

    // Retrieve manually written poems, sorted by timestamp, limited to numPoems
    // entries
    let manualPoems =
        this.poem.filter(poem => !poem.generated && (poem.user_id == userId))
            .sort((a, b) => getSortValue(b) - getSortValue(a));
    if (manualPoems.length > numPoems && numPoems > 0) {
      manualPoems = manualPoems.slice(0, numPoems);
    }

    return of({type: 'manual', poems: manualPoems});
  }
}
