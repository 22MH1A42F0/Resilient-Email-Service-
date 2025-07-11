// EmailService.js

class MockProvider {
    constructor(name) {
        this.name = name;
        this.failureRate = 0.3;
    }

    async send(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > this.failureRate) {
                    resolve(`${this.name} sent email to ${email.to}`);
                } else {
                    reject(new Error(`${this.name} failed to send email.`));
                }
            }, 100);
        });
    }
}

class CircuitBreaker {
    constructor(failureThreshold = 3, cooldownTime = 5000) {
        this.failureThreshold = failureThreshold;
        this.cooldownTime = cooldownTime;
        this.failureCount = 0;
        this.lastFailureTime = null;
    }

    allowRequest() {
        if (this.failureCount < this.failureThreshold) return true;
        const now = Date.now();
        if (now - this.lastFailureTime > this.cooldownTime) {
            this.failureCount = 0;
            return true;
        }
        return false;
    }

    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
    }
}

class EmailService {
    constructor() {
        this.providers = [
            { instance: new MockProvider("ProviderA"), breaker: new CircuitBreaker() },
            { instance: new MockProvider("ProviderB"), breaker: new CircuitBreaker() }
        ];
        this.sentEmails = new Set();
        this.statusLog = [];
        this.rateLimit = 5;
        this.emailQueue = [];
    }

    async send(email) {
        const id = `${email.to}-${email.subject}`;
        if (this.sentEmails.has(id)) {
            this.log(id, "Duplicate - skipped");
            return;
        }

        if (this.emailQueue.length >= this.rateLimit) {
            this.log(id, "Rate limit exceeded");
            return;
        }

        this.emailQueue.push(id);

        for (let provider of this.providers) {
            if (!provider.breaker.allowRequest()) {
                this.log(id, `${provider.instance.name} circuit open - skipping`);
                continue;
            }

            try {
                const response = await this.retrySend(provider.instance, email, 3);
                this.sentEmails.add(id);
                this.log(id, `Sent via ${provider.instance.name}`);
                break;
            } catch (err) {
                provider.breaker.recordFailure();
                this.log(id, `Failed via ${provider.instance.name}: ${err.message}`);
            }
        }

        this.emailQueue = this.emailQueue.filter(e => e !== id);
    }

    async retrySend(provider, email, maxRetries) {
        let delay = 200;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await provider.send(email);
            } catch (err) {
                if (attempt < maxRetries - 1) {
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                } else {
                    throw err;
                }
            }
        }
    }

    log(id, message) {
        const logMessage = `[${new Date().toISOString()}] ${id}: ${message}`;
        this.statusLog.push(logMessage);
        console.log(logMessage);
    }

    getStatusLog() {
        return this.statusLog;
    }
}

module.exports = EmailService;
