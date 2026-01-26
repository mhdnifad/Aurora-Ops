interface Config {
    env: string;
    port: number;
    frontendUrl: string;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        proPriceId: string;
        enterprisePriceId: string;
    };
    email: {
        smtp: {
            host: string;
            port: number;
            user: string;
            pass: string;
        };
        from: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=env.d.ts.map