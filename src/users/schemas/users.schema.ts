import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profilePicture?: string;

  @Prop()
  phone?: string;

  @Prop()
  department?: string;

  @Prop({ type: Date, default: Date.now })
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);