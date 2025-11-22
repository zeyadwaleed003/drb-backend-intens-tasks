import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../user.enums';
import { compare, hash } from 'bcrypt';
import { HydratedDocument } from 'mongoose';

type UserMethods = {
  comparePassword(password: string): Promise<boolean>;
  toJSON(): object;
};

export type UserDocument = HydratedDocument<User, UserMethods>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true })
  email: string;

  @Prop({
    required: true,
    minLength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function (password: string) {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return passwordRegex.test(password);
      },
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  })
  password: string;

  @Prop({
    trim: true,
  })
  phone?: string;

  @Prop({
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Prop({ type: String })
  refreshToken?: string | undefined;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = 10;
  this.password = await hash(this.password, salt);

  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return await compare(password, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};
