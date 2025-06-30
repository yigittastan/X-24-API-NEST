import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TimeEntry extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: false, default: null })
  pausedAt: Date | null;

  @Prop({ required: false, default: null })
  resumedAt: Date | null;
  
  @Prop()
  finishedAt?: Date;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: 0 })
  totalPausedDuration: number;

  @Prop({ type: String, default: '' })
  description: string;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);
