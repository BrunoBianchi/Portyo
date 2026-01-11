import request from "supertest";
import { app } from "../server";
import * as dotenv from "@dotenvx/dotenvx";

// Load environment variables for testing
dotenv.config();

// Mock console to keep test output clean
global.console = {
    ...console,
    // log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
};

// Mock services to avoid DB connection
jest.mock("../database/datasource", () => ({
    AppDataSource: {
        getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        }),
        initialize: jest.fn().mockResolvedValue(true),
    }
}));

jest.mock("../shared/services/user.service", () => ({
    login: jest.fn(),
    createNewUser: jest.fn(),
    findUserByEmail: jest.fn(),
}));

jest.mock("../shared/services/bio.service", () => ({
    createNewBio: jest.fn()
}));

jest.mock("../services/billing.service", () => ({
    BillingService: {
        createBilling: jest.fn(),
        getActivePlan: jest.fn().mockResolvedValue('free')
    }
}));

describe("Security Hardening Tests", () => {
    
    // 1. Test Payload Size Limits
    describe("Payload Body Limits", () => {
        it("should reject JSON payloads larger than 10kb", async () => {
            // Create a payload slightly larger than 10kb
            const largePayload = {
                data: "x".repeat(1024 * 11) // 11kb string
            };

            const res = await request(app)
                .post("/user/login") // Target any POST endpoint that parses body
                .send(largePayload);

            expect(res.status).toBe(413); // Payload Too Large
        });

        it("should accept JSON payloads smaller than 10kb", async () => {
            const smallPayload = {
                email: "test@example.com",
                password: "Password123"
            };

            // We expect 401 or 200, but NOT 413
            // Since we mocked login, if we mock implementation it might return 200
            // But we didn't provide mock implementation return value yet, so it likely returns undefined
            // Validation middleware Zod runs before service, so we might hit validation error or service error
            // Key is it's NOT 413
            const res = await request(app)
                .post("/user/login")
                .send(smallPayload);

            expect(res.status).not.toBe(413);
        });
    });

    // 2. Test HTTP Headers (Helmet)
    describe("Security Headers", () => {
        it("should have basic security headers enabled", async () => {
            const res = await request(app).get("/redirect/health-check-fake-url");
            
            // Helmet default headers
            expect(res.headers["x-dns-prefetch-control"]).toBe("off");
            expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
            expect(res.headers["strict-transport-security"]).toBeDefined(); // HSTS
            expect(res.headers["x-content-type-options"]).toBe("nosniff");
        });

        it("should hide X-Powered-By header", async () => {
            const res = await request(app).get("/redirect/health-check-fake-url");
            expect(res.headers["x-powered-by"]).toBeUndefined();
        });
    });

    // 3. Test Password Strength
    describe("Password Strength Validation", () => {
        const registerEndpoint = "/user"; // Based on route structure

        it("should reject weak passwords (too short)", async () => {
            const res = await request(app)
                .post(registerEndpoint)
                .send({
                    email: "test@example.com",
                    fullname: "Test User",
                    sufix: "testuser",
                    password: "short"
                });
            
            expect(res.status).toBe(400); // Bad Request (Zod validation)
        });

        it("should reject passwords without numbers", async () => {
            const res = await request(app)
                .post(registerEndpoint)
                .send({
                    email: "test@example.com",
                    fullname: "Test User",
                    sufix: "testuser",
                    password: "PasswordNoNumber"
                });
            
            expect(res.status).toBe(400);
        });

        it("should reject passwords without lowercase/uppercase mixed", async () => {
            const res = await request(app)
                .post(registerEndpoint)
                .send({
                    email: "test@example.com",
                    fullname: "Test User",
                    sufix: "testuser",
                    password: "password123" // no uppercase
                });
            
            expect(res.status).toBe(400);
        });
    });

    // 4. Test Webhook Signature (Basic)
    describe("Stripe Webhook Security", () => {
        it("should reject webhooks without signature header", async () => {
            const res = await request(app)
                .post("/public/stripe/webhook")
                .send({ type: "checkout.session.completed" });
            
            // Should fail because signature is missing
            // Could be 400 or 500 depending on implementation
            expect(res.status).not.toBe(200);
        });
    });
});
