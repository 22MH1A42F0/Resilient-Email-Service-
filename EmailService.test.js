// EmailService.test.js

const EmailService = require("./EmailService.js");

(async () => {
    const service = new EmailService();

    const email = { to: "unit@test.com", subject: "Unit Test", body: "This is a test." };

    await service.send(email); // First send should go through
    await service.send(email); // Duplicate, should be skipped

    const logs = service.getStatusLog();
    console.log("---- Test Log ----");
    console.log(logs);

    const sent = logs.some(log => log.includes("Sent via"));
    const skipped = logs.some(log => log.includes("Duplicate"));

    if (sent && skipped) {
        console.log("✅ All tests passed.");
    } else {
        console.error("❌ Test failed. Check log output above.");
    }
})();
