import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user-entity"
import { BioEntity } from "./entity/bio-entity"
import { PostEntity } from "./entity/posts-entity"
import { SitePostEntity } from "./entity/site-post-entity"
import { QRCodeEntity } from "./entity/qrcode-entity"
import { EmailEntity } from "./entity/email-entity"
import { IntegrationEntity } from "./entity/integration-entity"
import { ActivityEntity } from "./entity/activity-entity"
import { AutomationEntity, AutomationExecutionEntity } from "./entity/automation-entity"
import { EmailTemplateEntity } from "./entity/email-template-entity"
import { BookingSettingsEntity } from "./entity/booking-settings-entity"
import { BookingEntity } from "./entity/booking-entity"
import { BillingEntity } from "./entity/billing-entity"
import { PageViewEntity } from "./entity/page-view-entity"
import { FormEntity } from "./entity/form-entity"
import { FormAnswerEntity } from "./entity/form-answer-entity"
import { VerificationTokenEntity } from "./entity/verification-token-entity"
import { BioVerificationRequestEntity } from "./entity/bio-verification-request-entity"
import { PasswordResetEntity } from "./entity/password-reset-entity"
import { PortfolioItemEntity } from "./entity/portfolio-item-entity"
import { PortfolioCategoryEntity } from "./entity/portfolio-category-entity"
import { MarketingSlotEntity } from "./entity/marketing-slot-entity"
import { MarketingProposalEntity } from "./entity/marketing-proposal-entity"
import { ThemeEntity } from "./entity/theme-entity"

import { env } from "../config/env"
import { SystemSettings } from "../entities/system-settings.entity"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    entities: [UserEntity, BioEntity, PostEntity, SitePostEntity, QRCodeEntity, EmailEntity, IntegrationEntity, ActivityEntity, AutomationEntity, AutomationExecutionEntity, EmailTemplateEntity, BookingSettingsEntity, BookingEntity, BillingEntity, PageViewEntity, FormEntity, FormAnswerEntity, VerificationTokenEntity, PasswordResetEntity, SystemSettings, PortfolioItemEntity, PortfolioCategoryEntity, MarketingSlotEntity, MarketingProposalEntity, ThemeEntity, BioVerificationRequestEntity],
    synchronize: true,
    logging: false,
    ssl: env.DB_SSL ? {
        rejectUnauthorized: false,
        ca: env.DB_CA ? (env.DB_CA.includes("BEGIN CERTIFICATE") ? env.DB_CA : require("fs").readFileSync(env.DB_CA).toString()) : undefined,
    } : false,
})

