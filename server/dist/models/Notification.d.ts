import mongoose, { Document } from 'mongoose';
import { NOTIFICATION_TYPE } from '../config/constants';
export interface INotification extends Document {
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
    title: string;
    message: string;
    link?: string;
    metadata: Record<string, any>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map