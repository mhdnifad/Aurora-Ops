import mongoose, { Document } from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../config/constants';
export interface ITask extends Document {
    organizationId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
    priority: typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
    assigneeId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    dueDate?: Date;
    completedAt?: Date;
    tags: string[];
    attachments: Array<{
        _id?: mongoose.Types.ObjectId;
        name: string;
        url: string;
        size: number;
        type: string;
        publicId?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, mongoose.DefaultSchemaOptions> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITask>;
export default _default;
//# sourceMappingURL=Task.d.ts.map