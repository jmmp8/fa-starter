import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {environment} from '../environments/environment';
import {AuthService} from './auth.service';
import {CreatePoemResponse, CreateUserResponse} from './backend_response_types';

@Injectable({providedIn: 'root'})
export abstract class BaseBackendService {
  abstract createUser(email: string): Observable<CreateUserResponse>;
  abstract createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse>;
}

@Injectable({providedIn: 'root'})
export class BackendService extends BaseBackendService {
  private url = environment.backend_url;
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  constructor(
      private auth: AuthService,
      private http: HttpClient,
  ) {
    super();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`Error in ${operation}: `, error);
      return of(result as T);
    };
  }

  createUser(email: string): Observable<CreateUserResponse> {
    const endpoint = `${this.url}/api/create_user/${email}`;
    return this.http.get<CreateUserResponse>(endpoint).pipe(
        catchError(this.handleError<CreateUserResponse>('createUser')));
  }

  createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse> {
    // There must be a user logged in to associate with the new poem
    const userEmail: string|undefined = this.auth.getUserEmail();
    if (!userEmail)
      throw new Error('A user must be logged in before a poem can be createad');

    // Put parameters for creating the poem in request body
    const requestBody = {
      userEmail: userEmail,
      poemName: poemName.trim(),
      poemText: poemText.trim(),
      generated: generated,
    };

    // User has been identified, create a poem for them
    const endpoint = `${this.url}/api/create_poem`;
    return this.http
        .post<CreatePoemResponse>(endpoint, requestBody, this.httpOptions)
        .pipe(catchError(this.handleError<CreatePoemResponse>('createPoem')));
  }
}
