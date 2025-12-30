import Stripe from "stripe";
import { UserEntity } from "../../database/entity/user-entity";
import { AppDataSource } from "../../database/datasource";
import * as dotenv from "dotenv"
import { findBioById } from "./bio.service";
import { createIntegration, getIntegrationByNameAndBioId, updatedIntegration } from "./integration.service";
import { IntegrationEntity } from "../../database/entity/integration-entity";

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover",
});

export const createStripeConnectAccount = async (bioId: string) => {
    const bioObject = await findBioById(bioId, ['integrations', 'user']);
    if (!bioObject) throw new Error("Bio not found");

    let stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (stripeIntegration && stripeIntegration.account_id) {
        return createAccountLink(stripeIntegration.account_id);
    }

    const account = await stripe.accounts.create({
        type: "express",
        email: (bioObject.user as UserEntity).email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    if (stripeIntegration) {
        stripeIntegration.account_id = account.id;
        const integrationRepo = AppDataSource.getRepository(IntegrationEntity);
        await integrationRepo.save(stripeIntegration);
    } else {
        await createIntegration("stripe", account.id, bioObject.id);
    }

    return createAccountLink(account.id);
};

export const createAccountLink = async (accountId: string) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${frontendUrl}/dashboard/integrations?stripe=refresh`,
        return_url: `${frontendUrl}/dashboard/integrations?stripe=return`,
        type: "account_onboarding",
    });

    return accountLink.url;
};

export const createProductLink = async (productId: string, bioId: string) => {
    const bioObject = await findBioById(bioId, ['integrations', 'user']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        throw new Error("Stripe account not connected");
    }

    const account = await stripe.accounts.retrieve(stripeIntegration.account_id);
    if (!account.charges_enabled) {
        const reason = account.requirements?.disabled_reason 
            ? `Reason: ${account.requirements.disabled_reason}` 
            : 'Please complete your Stripe onboarding.';
        throw new Error(`Stripe account cannot make charges. ${reason}`);
    }

    const product = (await stripe.products.list({
        limit: 100,
        active: true,
        expand: ['data.default_price']
    }, {
        stripeAccount: stripeIntegration.account_id,
    })).data.find(p=>p.id == productId)

    if (!product || !product.default_price) {
        throw new Error("Product not found");
    }

    const priceId = typeof product.default_price === 'string' 
        ? product.default_price 
        : (product.default_price as Stripe.Price).id;

    const params: Stripe.PaymentLinkCreateParams = {
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
    };

    if ((bioObject.user as UserEntity).plan !== 'pro') {
        params.application_fee_percent = 2.5;
    }

    const paymentLink = await stripe.paymentLinks.create(params, {
        stripeAccount: stripeIntegration.account_id,
    });

    return paymentLink;
}

export const getStripeAccountStatus = async (bioId: string) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) return { connected: false };

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        return { connected: false };
    }

    const account = await stripe.accounts.retrieve(stripeIntegration.account_id);

    return {
        connected: account.charges_enabled && account.details_submitted,
        accountId: account.id,
        details: account
    };
};

export const createLoginLink = async (bioId: string) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        throw new Error("Stripe account not found");
    }

    const loginLink = await stripe.accounts.createLoginLink(stripeIntegration.account_id);
    return loginLink.url;
};

export const getStripeProducts = async (bioId: string) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        return [];
    }
    const products = await stripe.products.list({
        limit: 100,
        active: true,
        expand: ['data.default_price']
    }, {
        stripeAccount: stripeIntegration.account_id,
    });

    return products.data.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description,
        image: product.images[0] || null,
        price: (product.default_price as Stripe.Price)?.unit_amount ? (product.default_price as Stripe.Price).unit_amount! / 100 : 0,
        currency: (product.default_price as Stripe.Price)?.currency || 'usd',
        status: product.active ? 'active' : 'archived',
        url: product.url
    }));
};

export const createStripeProduct = async (bioId: string, data: { title: string, description?: string, price: number, currency: string, image?: string }) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        throw new Error("Stripe account not connected");
    }

    const product = await stripe.products.create({
        name: data.title,
        description: data.description,
        images: data.image ? [data.image] : [],
        default_price_data: {
            currency: data.currency,
            unit_amount: Math.round(data.price * 100),
        },
        expand: ['default_price']
    }, {
        stripeAccount: stripeIntegration.account_id,
    });

    return product;
};
