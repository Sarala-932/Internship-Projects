import { generateOtp, hashOtp, compareOtp } from "./src/utils/otp.mjs";

async function run() {
    const code = generateOtp();
    console.log("Generated code:", code);
    
    const hash = await hashOtp(code);
    console.log("Hash:", hash);
    
    const ok = await compareOtp(code, hash);
    console.log("Is Match:", ok);
}

run();
