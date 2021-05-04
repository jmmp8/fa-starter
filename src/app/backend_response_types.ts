/*
    This file contains types that match the responses given by the backend API.
    Many of the endpoints returns lists of these types, check db.py for details.
*/


export interface CreateUserResponse {
  id: number;
  email: string;
  created: boolean;
}
