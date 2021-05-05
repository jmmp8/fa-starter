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
        .subscribe((response: CreateUserResponse) => {
          expect(response.created).toBeTrue();
          expect(response.user.email).toEqual(expectedEmail);
        });

    // Make sure we called the correct endpoint
    const req =
        controller.expectOne(`${backendUrl}/db/create_user/${expectedEmail}`);
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
});
