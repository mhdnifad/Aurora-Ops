import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    organizationId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    mentions: mongoose.Types.ObjectId[];
    attachments: Array<{
        name: string;
        url: string;
        size: number;
        type: string;
    }>;
    editedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, mongoose.DefaultSchemaOptions> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComment>;
export default _default;
//# sourceMappingURL=Comment.d.ts.map