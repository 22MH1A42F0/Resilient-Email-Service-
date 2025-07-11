# Resilient Email Sending Service (JavaScript)

## Features
- ✅ Retry with exponential backoff
- ✅ Fallback to alternate provider
- ✅ Idempotency (no duplicate sends)
- ✅ Basic rate limiting
- ✅ Status tracking
- ✅ Circuit breaker (bonus)
- ✅ Logging
- ✅ Basic email queue
- ✅ Unit tests

## How to Run

### 1. Install Node.js
https://nodejs.org/

### 2. Run the Service
```
node EmailService.js
```

### 3. Run Tests
```
node EmailService.test.js
```

## Assumptions
- Email IDs are derived from `to + subject` to simulate uniqueness.
- Two mock providers simulate success/failure.

## Folder Contents
- `EmailService.js`: Main implementation
- `EmailService.test.js`: Simple test runner
- `README.md`: Setup and explanation