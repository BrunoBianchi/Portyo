import { AppDataSource } from "../database/datasource";
import { BioEntity } from "../database/entity/bio-entity";
import { PollEntity } from "../database/entity/poll-entity";
import { PollVoteEntity } from "../database/entity/poll-vote-entity";
import { addEmail } from "../shared/services/email.service";

export const pollRepository = AppDataSource.getRepository(PollEntity);
export const pollVoteRepository = AppDataSource.getRepository(PollVoteEntity);
export const bioRepository = AppDataSource.getRepository(BioEntity);

type PollOption = { id: string; label: string };
const DEFAULT_CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"];

const normalizeOptions = (options: any[] = []): PollOption[] => {
    return options
        .map((option: any, index: number) => {
            const label = String(option?.label ?? option?.text ?? "").trim();
            const id = String(option?.id ?? `option-${index + 1}`).trim();
            if (!label) return null;
            return { id, label };
        })
        .filter((option: PollOption | null): option is PollOption => Boolean(option));
};

const normalizeChartColors = (colors: any[] | undefined): string[] => {
    const normalized = (colors || [])
        .map((color) => String(color || "").trim())
        .filter((color) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color));

    return normalized.length > 0 ? normalized.slice(0, 12) : DEFAULT_CHART_COLORS;
};

const isPollAvailable = (poll: PollEntity) => {
    if (!poll.isActive) return false;
    const now = new Date();
    if (poll.startsAt && new Date(poll.startsAt) > now) return false;
    if (poll.endsAt && new Date(poll.endsAt) < now) return false;
    return true;
};

const buildVoterFingerprint = (email?: string, ip?: string, userAgent?: string) => {
    if (email?.trim()) {
        return `email:${email.trim().toLowerCase()}`;
    }

    if (ip?.trim()) {
        return `ip:${ip.trim()}`;
    }

    return `ua:${(userAgent || "unknown").slice(0, 180)}`;
};

const aggregateResults = (poll: PollEntity, votes: PollVoteEntity[]) => {
    const counters = new Map<string, number>();
    for (const option of poll.options || []) {
        counters.set(option.id, 0);
    }

    for (const vote of votes) {
        for (const optionId of vote.selectedOptionIds || []) {
            if (!counters.has(optionId)) continue;
            counters.set(optionId, (counters.get(optionId) || 0) + 1);
        }
    }

    const totalVotes = votes.length;
    const options = (poll.options || []).map((option) => {
        const count = counters.get(option.id) || 0;
        const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(2)) : 0;
        return {
            id: option.id,
            label: option.label,
            votes: count,
            percentage,
        };
    });

    return {
        pollId: poll.id,
        totalVotes,
        options,
    };
};

export const pollService = {
    async create(bioId: string, data: Partial<PollEntity>) {
        const poll = pollRepository.create({
            title: String(data.title || "").trim(),
            description: data.description || null,
            options: normalizeOptions(data.options || []),
            isActive: data.isActive ?? true,
            allowMultipleChoices: data.allowMultipleChoices ?? false,
            requireName: data.requireName ?? false,
            requireEmail: data.requireEmail ?? false,
            showResultsPublic: data.showResultsPublic ?? true,
            chartType: (data as any).chartType ?? "bar",
            chartColors: normalizeChartColors((data as any).chartColors),
            startsAt: data.startsAt ? new Date(data.startsAt) : null,
            endsAt: data.endsAt ? new Date(data.endsAt) : null,
            bioId,
        });

        if (!poll.title) throw new Error("Poll title is required");
        if (poll.options.length < 2) throw new Error("Poll must have at least 2 options");

        return await pollRepository.save(poll);
    },

    async findAllByBio(bioId: string) {
        return await pollRepository.find({
            where: { bioId },
            order: { createdAt: "DESC" },
        });
    },

    async findOne(id: string) {
        return await pollRepository.findOne({
            where: { id },
            relations: ["pollVotes"],
        });
    },

    async findPublic(id: string) {
        const poll = await pollRepository.findOne({ where: { id } });
        if (!poll) return null;
        if (!isPollAvailable(poll)) return null;
        return poll;
    },

    async update(id: string, data: Partial<PollEntity>) {
        const current = await pollRepository.findOneBy({ id });
        if (!current) throw new Error("Poll not found");

        const updatedOptions = data.options ? normalizeOptions(data.options) : current.options;
        if (updatedOptions.length < 2) throw new Error("Poll must have at least 2 options");

        const payload: Partial<PollEntity> = {
            ...data,
            options: updatedOptions,
        };

        if ((data as any).chartColors !== undefined) {
            (payload as any).chartColors = normalizeChartColors((data as any).chartColors);
        }

        if (data.startsAt !== undefined) {
            payload.startsAt = data.startsAt ? new Date(data.startsAt) : null;
        }
        if (data.endsAt !== undefined) {
            payload.endsAt = data.endsAt ? new Date(data.endsAt) : null;
        }

        await pollRepository.update(id, payload);
        return await pollRepository.findOneBy({ id });
    },

    async delete(id: string) {
        return await pollRepository.delete(id);
    },

    async getResults(pollId: string) {
        const poll = await pollRepository.findOne({
            where: { id: pollId },
            relations: ["pollVotes"],
        });

        if (!poll) throw new Error("Poll not found");
        return aggregateResults(poll, poll.pollVotes || []);
    },

    async vote(
        pollId: string,
        payload: { optionIds: string[]; name?: string; email?: string },
        metadata: { ip?: string; userAgent?: string }
    ) {
        const poll = await pollRepository.findOneBy({ id: pollId });
        if (!poll) throw new Error("Poll not found");
        if (!isPollAvailable(poll)) throw new Error("Poll is not accepting votes");

        const selectedOptionIds = Array.from(new Set((payload.optionIds || []).map((id) => String(id).trim()).filter(Boolean)));
        if (selectedOptionIds.length === 0) {
            throw new Error("At least one option is required");
        }
        if (!poll.allowMultipleChoices && selectedOptionIds.length > 1) {
            throw new Error("This poll allows only one option");
        }

        const validOptionIds = new Set((poll.options || []).map((option) => option.id));
        const hasInvalidOption = selectedOptionIds.some((optionId) => !validOptionIds.has(optionId));
        if (hasInvalidOption) {
            throw new Error("Invalid option selected");
        }

        if (poll.requireName && !payload.name?.trim()) {
            throw new Error("Name is required");
        }
        if (poll.requireEmail && !payload.email?.trim()) {
            throw new Error("Email is required");
        }

        const voterFingerprint = buildVoterFingerprint(payload.email, metadata.ip, metadata.userAgent);

        const existingVote = await pollVoteRepository.findOne({
            where: { pollId, voterFingerprint },
        });
        if (existingVote) {
            const duplicateError: any = new Error("You have already voted on this poll");
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        const vote = pollVoteRepository.create({
            pollId,
            selectedOptionIds,
            voterName: payload.name?.trim() || null,
            voterEmail: payload.email?.trim().toLowerCase() || null,
            voterFingerprint,
            ipAddress: metadata.ip || null,
            userAgent: metadata.userAgent || null,
        });

        await pollVoteRepository.save(vote);

        poll.votes = (poll.votes || 0) + 1;
        await pollRepository.save(poll);

        if (payload.email?.trim() && poll.requireEmail) {
            try {
                await addEmail(payload.email.trim().toLowerCase(), poll.bioId);
            } catch (error: any) {
                if (error?.statusCode !== 409) {
                    console.error("Failed to add email lead from poll vote", error);
                }
            }
        }

        const pollWithVotes = await pollRepository.findOne({
            where: { id: poll.id },
            relations: ["pollVotes"],
        });

        return {
            success: true,
            pollId: poll.id,
            showResults: poll.showResultsPublic,
            results: pollWithVotes ? aggregateResults(pollWithVotes, pollWithVotes.pollVotes || []) : null,
        };
    },
};
