import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {environment} from '../environments/environment';

@Injectable({providedIn: 'root'})
export abstract class BackendServiceBase {
  abstract createUser(email: string): Observable<void>;
}

@Injectable({providedIn: 'root'})
export class BackendService extends BackendServiceBase {
  private url = environment.backend_url;

  constructor(private http: HttpClient) {
    super();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error: any): Observable<T> => {
      console.error(`Error in ${operation}: ${error}`);
      return of(result as T);
    };
  }

  createUser(email: string): Observable<void> {
    const endpoint = `${this.url}/db/create_user/${email}`;
    return this.http.get<void>(endpoint).pipe(
        catchError(this.handleError<void>('createUser')));
  }
}
