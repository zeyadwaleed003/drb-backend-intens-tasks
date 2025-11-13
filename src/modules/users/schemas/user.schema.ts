import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../user.enums';
import { hash } from 'bcrypt';

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
    select: false,
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

  @Prop({ select: false })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = 10;
  this.password = await hash(this.password, salt);

  next();
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};
