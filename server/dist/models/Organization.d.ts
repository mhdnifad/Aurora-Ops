import mongoose, { Document } from 'mongoose';
import { ORGANIZATION_PLAN } from '../config/constants';
export interface IOrganization extends Document {
    name: string;
    slug: string;
    description?: string;
    plan: typeof ORGANIZATION_PLAN[keyof typeof ORGANIZATION_PLAN];
    settings: {
        timezone?: string;
        dateFormat?: string;
        language?: string;
    };
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
    subscriptionEndDate?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, mongoose.DefaultSchemaOptions> & IOrganization & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrganization>;
export default _default;
//# sourceMappingURL=Organization.d.ts.map