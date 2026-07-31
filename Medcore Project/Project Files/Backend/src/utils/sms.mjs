/**
 * SMS Utility Wrapper
 * In a production environment, this would integrate with Twilio, AWS SNS, or Gupshup.
 * For this development/internship project, we simulate SMS via Console Logs to save API credits.
 */

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
        }, 500); // Simulate network delay
    });
};
