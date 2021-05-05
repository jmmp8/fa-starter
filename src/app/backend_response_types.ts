/*
    This file contains types that match the responses given by the backend API.
    Many of the endpoints returns lists of these types, check db.py for details.
*/

// Models a row of the user table
export interface User {
  id: number;
  email: string;
}

// Models the response for the /db/create_user/<email> endpoint
export interface CreateUserResponse {
  created: boolean;
  user: User;
}
