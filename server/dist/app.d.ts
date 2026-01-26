import { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
declare class App {
    app: Application;
    server: HTTPServer;
    io: SocketIOServer;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    getServer(): HTTPServer;
    getIO(): SocketIOServer;
}
export default App;
//# sourceMappingURL=app.d.ts.map