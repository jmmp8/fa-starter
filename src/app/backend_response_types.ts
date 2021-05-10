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

// Models a row the poem table
export enum PoemPrivacyLevel {
  public,
  private,
}

export enum PoemForm {
  haiku,
  sonnet,
  tonka,
}

export interface Poem {
  // Note, a poem in the database should never have a null id
  // a null id indicates that the object has not been saved to the database
  id: number|null;

  user_id: number;
  creation_timestamp: Date|null;
  modified_timestamp: Date|null;
  privacy_level: PoemPrivacyLevel;
  archived: boolean;
  form: PoemForm;
  generated: boolean;
  text: string;
  num_likes: number;
  num_dislikes: number;
}
