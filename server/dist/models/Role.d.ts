import mongoose, { Document } from 'mongoose';
export interface IRole extends Document {
    name: string;
    displayName: string;
    description: string;
    organizationId: mongoose.Types.ObjectId;
    permissions: string[];
    isSystemRole: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IRole, {}, {}, {}, mongoose.Document<unknown, {}, IRole, {}, mongoose.DefaultSchemaOptions> & IRole & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRole>;
export default _default;
//# sourceMappingURL=Role.d.ts.map