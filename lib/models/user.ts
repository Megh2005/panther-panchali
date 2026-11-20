import type { ObjectId } from "mongodb";

export interface UserRecord {
  _id?: ObjectId | string;
  name: string;
  email: string;
  image?: string;
  googleId?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
