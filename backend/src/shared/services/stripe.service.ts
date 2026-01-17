import Stripe from "stripe";
import { UserEntity } from "../../database/entity/user-entity";
import { AppDataSource } from "../../database/datasource";
import { findBioById } from "./bio.service";
import { createIntegration } from "./integration.service";
import { IntegrationEntity } from "../../database/entity/integration-entity";
import { env } from "../../config/env";
import { PLAN_LIMITS, PlanType } from "../constants/plan-limits";

const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
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
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${env.FRONTEND_URL}/dashboard/integrations?stripe=refresh`,
        return_url: `${env.FRONTEND_URL}/dashboard/integrations?stripe=return`,
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

    const userPlan = (bioObject.user as UserEntity).plan as PlanType || 'free';
    const feeMetric = PLAN_LIMITS[userPlan].storeFee; // 0.03, 0, etc.

    if (feeMetric > 0) {
        const priceObject = product.default_price as Stripe.Price;
        
        if (priceObject.type === 'recurring') {
             params.application_fee_percent = feeMetric * 100;
        } else if (priceObject.unit_amount) {
            // Provide exact amount for one-time payments
            params.application_fee_amount = Math.round(priceObject.unit_amount * feeMetric);
        }
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

export const updateStripeProduct = async (bioId: string, productId: string, data: { title?: string, description?: string, price?: number, currency?: string, image?: string, active?: boolean }) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        throw new Error("Stripe account not connected");
    }

    const updateData: any = {};
    if (data.title) updateData.name = data.title;
    if (data.description) updateData.description = data.description;
    if (data.image) updateData.images = [data.image];
    if (data.active !== undefined) updateData.active = data.active;

    // Price update requires creating a new price and setting it as default
    if (data.price && data.currency) {
        const newPrice = await stripe.prices.create({
            unit_amount: Math.round(data.price * 100),
            currency: data.currency,
            product: productId,
        }, {
            stripeAccount: stripeIntegration.account_id,
        });

        updateData.default_price = newPrice.id;
    }

    const product = await stripe.products.update(productId, updateData, {
        stripeAccount: stripeIntegration.account_id,
    });

    return product;
};

export const archiveStripeProduct = async (bioId: string, productId: string) => {
    const bioObject = await findBioById(bioId, ['integrations']);
    if (!bioObject) throw new Error("Bio not found");

    const stripeIntegration = bioObject.integrations?.find(i => i.name === "stripe");

    if (!stripeIntegration || !stripeIntegration.account_id) {
        throw new Error("Stripe account not connected");
    }

    const product = await stripe.products.update(productId, { active: false }, {
        stripeAccount: stripeIntegration.account_id,
    });

    return product;
};

export const createProposalPaymentLink = async (proposalId: string, amount: number, slotName: string, duration: number, connectedAccountId: string) => {
    // Calculate application fee (5%)
    const unitAmount = Math.round(amount * 100); // Convert to cents
    const applicationFeeAmount = Math.round(unitAmount * 0.05);

    // Create a direct payment link on the connected account
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Advertising Slot: ${slotName}`,
                        description: `${duration} days of advertising on ${slotName}`,
                    },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            },
        ],
        application_fee_amount: applicationFeeAmount,
        metadata: {
            proposalId,
            type: 'marketing_proposal',
        },
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${env.FRONTEND_URL}/payment-success?proposalId=${proposalId}`,
            },
        },
    }, {
        stripeAccount: connectedAccountId,
    });

    return paymentLink;
};

export const verifyMarketingProposalPayment = async (proposalId: string, connectedAccountId: string) => {
    const listResult = await stripe.paymentLinks.list({
        limit: 100,
    }, {
        stripeAccount: connectedAccountId,
    });
    const paymentLinks = (listResult.data || []).filter(link => link.metadata?.proposalId === proposalId);

    if (!paymentLinks.length) {
        return { found: false, paid: false };
    }

    for (const link of paymentLinks) {
        const sessions = await stripe.checkout.sessions.list({
            payment_link: link.id,
            limit: 10,
        }, {
            stripeAccount: connectedAccountId,
        });

        const paidSession = sessions.data.find(session => session.payment_status === 'paid' || session.status === 'complete');
        if (paidSession) {
            return {
                found: true,
                paid: true,
                paymentLinkId: link.id,
                sessionId: paidSession.id,
            };
        }
    }

    return { found: true, paid: false };
};

