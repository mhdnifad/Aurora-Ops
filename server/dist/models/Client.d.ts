import mongoose, { Document } from 'mongoose';
export interface IClient extends Document {
    organizationId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, mongoose.DefaultSchemaOptions> & IClient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClient>;
export default _default;
//# sourceMappingURL=Client.d.ts.map