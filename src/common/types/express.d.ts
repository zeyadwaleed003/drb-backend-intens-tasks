import { UserDocument } from 'src/modules/users/schemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
