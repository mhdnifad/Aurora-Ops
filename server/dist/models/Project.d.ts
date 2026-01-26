import mongoose, { Document } from 'mongoose';
import { PROJECT_STATUS } from '../config/constants';
export interface IProject extends Document {
    organizationId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    slug: string;
    icon?: string;
    color?: string;
    status: typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
    ownerId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProject>;
export default _default;
//# sourceMappingURL=Project.d.ts.map