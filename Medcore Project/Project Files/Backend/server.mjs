import app from "./src/app.mjs";
import {config} from "./src/config/config.mjs";
import connectDB from "./src/config/db.mjs";
import http from "http";
import { initSocket } from "./src/services/socket.service.mjs";

const startServer = async () => {
    try {
        await connectDB();
        
        // Wrap express with HTTP server for Socket.io
        const httpServer = http.createServer(app);
        initSocket(httpServer);

        httpServer.listen(config.PORT, () => {
            console.log(`Server listening on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.messge);
        process.exit(1);
    }
};

startServer();
