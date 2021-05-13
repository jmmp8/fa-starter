/*
    This file contains types that match the responses given by the backend API.
    Many of the endpoints returns lists of these types, check db.py for details.
*/

// Models a row of the user table
export interface User {
  id: number;
  email: string;
}

// Models the response for the /api/create_user/<email> endpoint
export interface CreateUserResponse {
  created: boolean;
  user: User;
}


// Models a row the poem table
export enum PoemPrivacyLevel {
  Public,
  Private,
}

export enum PoemForm {
  Haiku,
  Sonnet,
  Tonka,
}

export interface Poem {
  id: number;
  user_id: number;
  creation_timestamp: Date|null;
  modified_timestamp: Date|null;
  privacy_level: PoemPrivacyLevel;
  archived: boolean;
  form: PoemForm;
  generated: boolean;
  name: string;
  text: string;
  num_likes: number;
  num_dislikes: number;
}

// Models the response for the /api/create_user/<email> endpoint
export interface CreatePoemResponse {
  created: boolean;
  poem: Poem;
}

// Models the response for the /api/get_poems/<poemType>/<numPoems>/<email?>
// endpoint
export interface GetPoemsResponse {
  type: string;
  poems: Poem[];
}
