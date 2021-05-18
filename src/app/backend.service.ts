import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {firstValueFrom, Observable, of, Subject} from 'rxjs';
import {catchError, map, mergeMap, startWith, tap} from 'rxjs/operators';

import {environment} from '../environments/environment';

import {AuthService} from './auth.service';
import {CreatePoemResponse, CreateUserResponse, EditPoemResponse, GetPoemsResponse, Poem} from './backend_response_types';

@Injectable({providedIn: 'root'})
export abstract class BaseBackendService {
  // Subject emits whenever the list of poems needs to be refreshed
  refreshManualPoemsSubject = new Subject<void>();

  // Observables for the various types of poems
  readonly manualPoems$ = this.refreshManualPoemsSubject.pipe(
      startWith(void 0),
      mergeMap(() => this._getPoemsRequest('manual', 0)),
      map(serverResponse => serverResponse.poems),
  );

  // Functions to create new information. The backend will create new rows
  // in the database
  abstract createUser(email: string): Observable<CreateUserResponse|undefined>;
  abstract createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse|undefined>;
  abstract editPoem(editedPoem: Poem): Observable<EditPoemResponse|undefined>;

  // Functions that trigger an update to a poem observable or return an
  // observable that the front end can subscribe to
  refreshManualPoems(): void {
    this.refreshManualPoemsSubject.next();
  }

  getManualPoems(): Observable<Poem[]> {
    return this.manualPoems$;
  }

  // Returns the http get Observable for fetching poems
  protected abstract _getPoemsRequest(poemType: string, numPoems: number):
      Observable<GetPoemsResponse>;
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

  createUser(email: string): Observable<CreateUserResponse|undefined> {
    const endpoint = `${this.url}/api/create_user/${email}`;
    return this.http.get<CreateUserResponse>(endpoint).pipe(
        catchError(this.handleError<CreateUserResponse>('createUser')));
  }

  createPoem(poemName: string, poemText: string, generated: boolean):
      Observable<CreatePoemResponse|undefined> {
    // There must be a user logged in to associate with the new poem
    const userEmail: string|undefined = this.auth.getUserEmail();
    if (!userEmail)
      throw new Error('A user must be logged in before a poem can be createad');

    // Put parameters for creating the poem in request body
    const requestBody = {
      userEmail: userEmail,
      poemName: poemName.trim(),
      poemText: poemText,
      generated: generated,
    };

    // User has been identified, create a poem for them
    const endpoint = `${this.url}/api/create_poem`;
    return this.http
        .post<CreatePoemResponse>(endpoint, requestBody, this.httpOptions)
        .pipe(
            catchError(this.handleError<CreatePoemResponse>('createPoem')),
            tap(_ => this.refreshManualPoems()),
        );
  }

  editPoem(editedPoem: Poem): Observable<EditPoemResponse|undefined> {
    if (editedPoem.id == undefined) {
      throw new Error('An edited poem must have an ID');
    }

    const endpoint = `${this.url}/api/edit_poem/${editedPoem.id}`;
    const requestBody = {poem: editedPoem};

    return this.http
        .post<EditPoemResponse>(endpoint, requestBody, this.httpOptions)
        .pipe(
            catchError(this.handleError<EditPoemResponse>('editPoem')),
            tap(_ => this.refreshManualPoems()),
        );
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
