import app from "./src/app.mjs";
import {config} from "./src/config/config.mjs";
import connectDB from "./src/config/db.mjs";

const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.PORT, () => {
            console.log(`Server listening on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.messge);
        process.exit(1);
    }
};

startServer();
