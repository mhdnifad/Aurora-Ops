import mongoose, { Document } from 'mongoose';
export interface IActivity extends Document {
    user: mongoose.Types.ObjectId;
    action: string;
    description?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IActivity, {}, {}, {}, mongoose.Document<unknown, {}, IActivity, {}, mongoose.DefaultSchemaOptions> & IActivity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IActivity>;
export default _default;
//# sourceMappingURL=Activity.d.ts.map