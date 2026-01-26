import mongoose, { Document } from 'mongoose';
export interface IInvoice extends Document {
    organizationId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
    stripeInvoiceId?: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;
    paidAt?: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, mongoose.DefaultSchemaOptions> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInvoice>;
export default _default;
//# sourceMappingURL=Invoice.d.ts.map