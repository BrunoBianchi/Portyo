import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user-entity"
import { BioEntity } from "./entity/bio-entity"
import { PostEntity } from "./entity/posts-entity"
import { QRCodeEntity } from "./entity/qrcode-entity"
import { EmailEntity } from "./entity/email-entity"
import { IntegrationEntity } from "./entity/integration-entity"
import { ActivityEntity } from "./entity/activity-entity"
import { AutomationEntity, AutomationExecutionEntity } from "./entity/automation-entity"
import { EmailTemplateEntity } from "./entity/email-template-entity"
import { BookingSettingsEntity } from "./entity/booking-settings-entity"
import { BookingEntity } from "./entity/booking-entity"
import { BillingEntity } from "./entity/billing-entity"

import { env } from "../config/env"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    entities: [UserEntity, BioEntity, PostEntity, QRCodeEntity, EmailEntity, IntegrationEntity, ActivityEntity, AutomationEntity, AutomationExecutionEntity, EmailTemplateEntity, BookingSettingsEntity, BookingEntity, BillingEntity],
    synchronize: true,
    logging: false,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
})

