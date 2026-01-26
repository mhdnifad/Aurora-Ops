declare class JobQueue {
    private jobs;
    private name;
    constructor(name: string);
    process(handler: (job: any) => Promise<any>): Promise<(job: any) => Promise<any>>;
    add(data: any, _options?: any): Promise<{
        id: string;
    }>;
    on(_event: string, _handler: (job: any, err?: any) => void): this;
}
declare const emailQueue: JobQueue;
declare const notificationQueue: JobQueue;
declare const reportQueue: JobQueue;
declare const cleanupQueue: JobQueue;
export { emailQueue, notificationQueue, reportQueue, cleanupQueue };
declare const _default: {
    emailQueue: JobQueue;
    notificationQueue: JobQueue;
    reportQueue: JobQueue;
    cleanupQueue: JobQueue;
};
export default _default;
//# sourceMappingURL=index.d.ts.map