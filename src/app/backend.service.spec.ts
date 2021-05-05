import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

import {environment} from '../environments/environment';

import {BackendService} from './backend.service';
import {CreateUserResponse} from './backend_response_types';

describe('BackendService', () => {
  let service: BackendService;
  let controller: HttpTestingController;
  const backendUrl = environment.backend_url;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
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
        .subscribe((response: CreateUserResponse[]) => {
          if (response.length != 1)
            throw new Error(
                'Expected create_user to give a non-empty response');
          expect(response[0].created).toBeTrue();
          expect(response[0].email).toEqual(expectedEmail);
        });

    // Make sure we called the correct endpoint
    const req =
        controller.expectOne(`${backendUrl}/db/create_user/${expectedEmail}`);
    expect(req.request.method).toEqual('GET');

    // Respond with some test information
    const resp: CreateUserResponse = {
      'id': 1,
      'email': expectedEmail,
      'created': true,
    };
    req.flush([resp]);

    // Assert there are no extra requests
    controller.verify();
  });
});
