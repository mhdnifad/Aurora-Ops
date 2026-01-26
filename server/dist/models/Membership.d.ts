import mongoose, { Document } from 'mongoose';
import { MEMBERSHIP_STATUS } from '../config/constants';
export interface IMembership extends Document {
    userId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    role: string;
    status: typeof MEMBERSHIP_STATUS[keyof typeof MEMBERSHIP_STATUS];
    invitedBy?: mongoose.Types.ObjectId;
    invitedAt: Date;
    joinedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IMembership, {}, {}, {}, mongoose.Document<unknown, {}, IMembership, {}, mongoose.DefaultSchemaOptions> & IMembership & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMembership>;
export default _default;
//# sourceMappingURL=Membership.d.ts.map