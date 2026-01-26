import mongoose, { Document } from 'mongoose';
export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    deviceInfo: {
        userAgent: string;
        ip: string;
        browser?: string;
        os?: string;
        device?: string;
    };
    isActive: boolean;
    lastActivityAt: Date;
    expiresAt: Date;
    createdAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}, mongoose.DefaultSchemaOptions> & ISession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISession>;
export default _default;
//# sourceMappingURL=Session.d.ts.map