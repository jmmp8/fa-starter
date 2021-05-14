import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {firstValueFrom, Observable, of, Subject} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {environment} from '../environments/environment';
import {AuthService} from './auth.service';
import {CreatePoemResponse, CreateUserResponse, GetPoemsResponse, Poem} from './backend_response_types';

@Injectable({providedIn: 'root'})
export abstract class BaseBackendService {
  // Observables and subjects for the various types of poems
  protected manualPoemsSubject = new Subject<GetPoemsResponse>();
  readonly manualPoems$ =
      this.manualPoemsSubject.pipe(map(response => response.poems));

  // Functions to create new information. The backend will create new rows in
  // the database
  abstract createUser(email: string): Observable<CreateUserResponse>;
  abstract createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse>;

  // Functions that trigger an update to a poem observable
  abstract getManualPoems(numPoems: number): Promise<void>|Promise<Poem[]>;
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
        .pipe(
            catchError(this.handleError<CreatePoemResponse>('createPoem')),
            tap(_ => this.getManualPoems()),
        );
  }

  async getManualPoems(numPoems = 0): Promise<void> {
    const manualPoems =
        await firstValueFrom(this._getPoemsRequest('manual', numPoems));
    this.manualPoemsSubject.next(manualPoems);
  }

  protected _getPoemsRequest(poemType: string, numPoems: number):
      Observable<GetPoemsResponse> {
    let endpoint = `${this.url}/api/get_poems/${poemType}/${numPoems}`;
    const userEmail: string|undefined = this.auth.getUserEmail();

    if (poemType === 'manual') {
      // There must be a user logged in to retrieve poems for
      if (!userEmail)
        throw new Error(
            'A user must be logged in before a poems can be retrieved');

      endpoint = `${endpoint}/${userEmail}`;
      return this.http.get<GetPoemsResponse>(endpoint).pipe(
          catchError(this.handleError<GetPoemsResponse>('getPoems')));
    } else if (
        poemType === 'best' || poemType === 'new' || poemType == 'liked' ||
        poemType === 'generated') {
      throw new Error(
          `Retrieving poems not yet implemented for ${poemType} poems`);
    } else {
      throw new Error(`Unrecognized poem type: ${poemType}`);
    }
  }
}
