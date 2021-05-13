import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

import {environment} from '../environments/environment';
import {AuthService} from './auth.service';

import {BackendService} from './backend.service';
import {CreatePoemResponse, CreateUserResponse, GetPoemsResponse, PoemForm, PoemPrivacyLevel} from './backend_response_types';
import {AuthServiceStub} from './testing/auth-service-stub';

describe('BackendService', () => {
  let authServiceStub: AuthServiceStub;
  let controller: HttpTestingController;
  let service: BackendService;
  const backendUrl = environment.backend_url;

  beforeEach(() => {
    authServiceStub = new AuthServiceStub();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: AuthService, useValue: authServiceStub}],
    });
    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject(BackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create users', () => {
    const expectedEmail = 'expected_email@test.com';

    // Call the backend create_user endpoint
    service.createUser(expectedEmail)
        .subscribe((response: CreateUserResponse) => {
          expect(response.created).toBeTrue();
          expect(response.user.email).toEqual(expectedEmail);
        });

    // Make sure we called the correct endpoint
    const req =
        controller.expectOne(`${backendUrl}/api/create_user/${expectedEmail}`);
    expect(req.request.method).toEqual('GET');

    // Respond with some test information
    const resp: CreateUserResponse = {
      'created': true,
      'user': {
        'id': 1,
        'email': expectedEmail,
      },
    };
    req.flush(resp);

    // Assert there are no extra requests
    controller.verify();
  });

  it('should create poems', () => {
    const expectedPoemName = 'testName';
    const expectedPoemText = 'test text\nsecond line';
    const generated = false;

    // Call the backend create_poem endpoint
    service.createPoem(expectedPoemName, expectedPoemText, generated)
        .subscribe((response: CreatePoemResponse) => {
          expect(response.created).toBeTrue();
          expect(response.poem.text).toEqual(expectedPoemText);
          expect(response.poem.name).toEqual(expectedPoemName);
        });

    // Make sure we called the correct endpoint
    const req = controller.expectOne(`${backendUrl}/api/create_poem`);
    expect(req.request.method).toEqual('POST');

    // Make sure the body has all the parameters
    const body = req.request.body;
    expect(body.userEmail).toEqual(authServiceStub.getUserEmail());
    expect(body.poemName).toEqual(expectedPoemName);
    expect(body.poemText).toEqual(expectedPoemText);
    expect(body.generated).toEqual(generated);

    // Respond with some test information
    const resp: CreatePoemResponse = {
      'created': true,
      'poem': {
        'id': 1,
        'user_id': 1,
        'creation_timestamp': new Date(),
        'modified_timestamp': null,
        'privacy_level': PoemPrivacyLevel.Public,
        'archived': true,
        'form': PoemForm.Haiku,
        'generated': generated,
        'name': expectedPoemName,
        'text': expectedPoemText,
        'num_likes': 0,
        'num_dislikes': 0,
      },
    };
    req.flush(resp);

    // Assert there are no extra requests
    controller.verify();
  });

  it('should retrieve manually written poems', () => {
    const num_poems_to_get = 5;

    // Call the backend create_poem endpoint
    service.manualPoemsObservable.subscribe(
        poems => expect(poems.length).toBeLessThanOrEqual(num_poems_to_get));
    service.getManualPoems(num_poems_to_get);

    // Make sure we called the correct endpoint
    const req = controller.expectOne(`${backendUrl}/api/get_poems/manual/${
        num_poems_to_get}/${authServiceStub.getUserEmail()}`);
    expect(req.request.method).toEqual('GET');

    // Respond with some test information
    const resp: GetPoemsResponse = {
      'type': 'manual',
      'poems': [{
        'id': 1,
        'user_id': 1,
        'creation_timestamp': new Date(),
        'modified_timestamp': null,
        'privacy_level': PoemPrivacyLevel.Public,
        'archived': true,
        'form': null,
        'generated': false,
        'name': 'test name',
        'text': 'test text',
        'num_likes': 0,
        'num_dislikes': 0,
      }],
    };
    req.flush(resp);

    // Assert there are no extra requests
    controller.verify();
  });
});
