import { AppDataSource } from "../../database/datasource";
import { CompanyEntity } from "../../database/entity/company-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import * as bcrypt from "bcrypt";
import * as jose from "jose";
import { env } from "../../config/env";

const CompanyRepository = AppDataSource.getRepository(CompanyEntity);

export async function registerCompany(data: {
    companyName: string;
    email: string;
    password: string;
    logo?: string;
    website?: string;
    description?: string;
    industry?: string;
}): Promise<{ company: CompanyEntity; token: string }> {
    const existing = await CompanyRepository.findOne({ where: { email: data.email } });
    if (existing) {
        throw new ApiError(APIErrors.conflictError, "Email already registered", 409);
    }

    const company = CompanyRepository.create({
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        logo: data.logo,
        website: data.website,
        description: data.description,
        industry: data.industry,
    });

    const saved = await CompanyRepository.save(company);
    const token = await generateCompanyToken(saved);

    return { company: saved, token };
}

export async function loginCompany(email: string, password: string): Promise<{ company: CompanyEntity; token: string }> {
    const company = await CompanyRepository.findOne({ where: { email } });
    if (!company) {
        throw new ApiError(APIErrors.authenticationError, "Invalid email or password", 401);
    }

    if (company.isBanned) {
        throw new ApiError(APIErrors.forbiddenError, "Account is banned", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
        throw new ApiError(APIErrors.authenticationError, "Invalid email or password", 401);
    }

    const token = await generateCompanyToken(company);
    return { company, token };
}

export async function getCompanyById(id: string): Promise<CompanyEntity | null> {
    return CompanyRepository.findOne({ where: { id } });
}

export async function updateCompany(id: string, data: Partial<{
    companyName: string;
    logo: string;
    website: string;
    description: string;
    industry: string;
}>): Promise<CompanyEntity> {
    const company = await CompanyRepository.findOne({ where: { id } });
    if (!company) {
        throw new ApiError(APIErrors.notFoundError, "Company not found", 404);
    }

    Object.assign(company, data);
    return CompanyRepository.save(company);
}

export async function generateCompanyToken(company: CompanyEntity): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new jose.SignJWT({
        companyId: company.id,
        email: company.email,
        companyName: company.companyName,
        type: "company",
    } as jose.JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("portyo-company")
        .setExpirationTime("7d")
        .sign(secret);
    return token;
}

export async function verifyCompanyToken(token: string): Promise<{ companyId: string; email: string; companyName: string }> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: "portyo-company",
    });

    if (!payload.companyId || payload.type !== "company") {
        throw new ApiError(APIErrors.unauthorizedError, "Invalid company token", 401);
    }

    return {
        companyId: payload.companyId as string,
        email: payload.email as string,
        companyName: payload.companyName as string,
    };
}
