import mongoose, { Document } from 'mongoose';
export interface ISubscription extends Document {
    organizationId: mongoose.Types.ObjectId;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
    plan: 'free' | 'pro' | 'enterprise';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
    trialStart?: Date;
    trialEnd?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}, mongoose.DefaultSchemaOptions> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubscription>;
export default _default;
//# sourceMappingURL=Subscription.d.ts.map