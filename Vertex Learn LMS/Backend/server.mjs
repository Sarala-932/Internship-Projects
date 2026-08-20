import app from "./src/app.mjs";
import connectDB from "./src/config/db.mjs";
import {config} from "./src/config/config.mjs";

const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.PORT, () => {
            console.log(`Server is listening on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
