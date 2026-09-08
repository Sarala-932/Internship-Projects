
export const sendSms = async (phoneNumber, message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("\n======================================");
            console.log("📱 [DEV SMS SIMULATION]");
            console.log(`To: ${phoneNumber}`);
            console.log(`Message: ${message}`);
            console.log("======================================\n");

            resolve({
                success: true,
                message: "SMS sent successfully (simulated)",
                timestamp: new Date()
            });
        }, 500);
    });
};
