import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: string;
    entityId?: mongoose.Types.ObjectId;
    changes?: Record<string, any>;
    metadata: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
export default _default;
//# sourceMappingURL=AuditLog.d.ts.map