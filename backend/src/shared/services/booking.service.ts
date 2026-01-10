import { AppDataSource } from "../../database/datasource";
import { BookingEntity, BookingStatus } from "../../database/entity/booking-entity";
import { BookingSettingsEntity } from "../../database/entity/booking-settings-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { BillingService } from "../../services/billing.service";
import { sendBookingConfirmationEmail, sendBookingConfirmedEmail } from "./mailer.service";
import { MoreThan, Between } from "typeorm";
import { startOfDay, endOfDay, addMinutes, format, parse, isBefore, isAfter, isSameDay } from "date-fns";
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from "./google-calendar.service";

const bookingRepository = AppDataSource.getRepository(BookingEntity);
const settingsRepository = AppDataSource.getRepository(BookingSettingsEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

/**
 * Get booking settings for a bio. Creates default if not exists.
 */
export const getBookingSettings = async (bioId: string) => {
    let settings = await settingsRepository.findOne({ where: { bioId } });

    if (!settings) {
        // Check if bio exists
        const bio = await bioRepository.findOne({ where: { id: bioId }, relations: ['user'] });
        if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

        // Note: Settings can be fetched but only PAID users can save/use booking features.
        // The middleware enforces this at the route level.

        settings = settingsRepository.create({
            bioId,
            durationMinutes: 30,
            availability: {
                mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
            },
            blockedDates: []
        });
        await settingsRepository.save(settings);
    }
    return settings;
};

/**
 * Update booking settings.
 */
export const updateBookingSettings = async (bioId: string, updates: Partial<BookingSettingsEntity>) => {
    const settings = await getBookingSettings(bioId);
    
    // Validate user has paid plan (Standard or Pro)
    const bio = await bioRepository.findOne({ where: { id: bioId }, relations: ['user'] });
    if (bio) {
        const activePlan = await BillingService.getActivePlan(bio.user.id);
        if (activePlan === 'free') {
            throw new ApiError(APIErrors.paymentRequiredError, "Booking requires a paid plan (Standard or Pro)", 402);
        }
    }

    Object.assign(settings, updates);
    return await settingsRepository.save(settings);
};

/**
 * Get available slots for a specific date.
 */
export const getAvailableSlots = async (bioId: string, dateStr: string) => {
    const settings = await getBookingSettings(bioId);
    
    if (settings.updatesPaused) return []; // Paused
    if (settings.blockedDates.includes(dateStr)) return []; // Blocked date

    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const dayOfWeek = format(date, 'ccc').toLowerCase(); // 'mon', 'tue', etc.
    const ranges = settings.availability[dayOfWeek] || [];

    if (ranges.length === 0) return [];

    // simple hardcoded validation that date is not in the past (optional, maybe allow scheduling for today if time is future)
    if (isBefore(date, startOfDay(new Date()))) return []; 

    // Generate potential slots
    const potentialSlots: Date[] = [];
    for (const range of ranges) {
        // range format "HH:mm-HH:mm"
        const [startStr, endStr] = range.split('-');
        let current = parse(`${dateStr} ${startStr}`, 'yyyy-MM-dd HH:mm', new Date());
        const end = parse(`${dateStr} ${endStr}`, 'yyyy-MM-dd HH:mm', new Date());

        while (isBefore(current, end)) {
            const nextSlot = addMinutes(current, settings.durationMinutes);
            if (isAfter(nextSlot, end)) break;

            potentialSlots.push(current);
            current = nextSlot;
        }
    }

    // Filter booked slots
    const bookings = await bookingRepository.find({
        where: {
            bioId,
            bookingDate: Between(startOfDay(date), endOfDay(date)),
            status: BookingStatus.CONFIRMED
        }
    });

    const freeSlots = potentialSlots.filter(slot => {
        // Check if any booking conflicts with this slot
        // Simple logic: Exact match of start time (assuming standardized slots) 
        // Or overlap check. For now, strict slot matching.
        const slotTime = slot.getTime();
        return !bookings.some(b => {
             const bookingTime = new Date(b.bookingDate).getTime();
             return Math.abs(bookingTime - slotTime) < 60000; // tolerance 1 min
        });
    });

    // Format for response
    return freeSlots.map(slot => format(slot, 'HH:mm'));
};

// Helper for random token
function generateToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new booking
 */
export const createBooking = async (bioId: string, data: { date: string, time: string, name: string, email: string, phone?: string }) => {
    const settings = await getBookingSettings(bioId);
    if (settings.updatesPaused) throw new ApiError(APIErrors.badRequestError, "Bookings are paused", 400);

    const bookingDate = parse(`${data.date} ${data.time}`, 'yyyy-MM-dd HH:mm', new Date());

    // Check availability again to be safe
    const slots = await getAvailableSlots(bioId, data.date);
    if (!slots.includes(data.time)) {
        throw new ApiError(APIErrors.conflictError, "Slot is no longer available", 409);
    }

    const token = generateToken();

    const booking = bookingRepository.create({
        bioId,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        bookingDate,
        status: BookingStatus.PENDING,
        confirmationToken: token
    });

    await bookingRepository.save(booking);

    // Get bio info for email
    const bio = await bioRepository.findOne({ where: { id: bioId } });
    
    // Send confirmation email
    sendBookingConfirmationEmail({
        customerName: data.name,
        customerEmail: data.email,
        bookingDate,
        token,
        bioName: bio?.sufix || 'Unknown'
    });

    return booking;
};

/**
 * Confirm a booking by token
 */
export const confirmBooking = async (token: string) => {
    const booking = await bookingRepository.findOne({ where: { confirmationToken: token } });
    if (!booking) throw new ApiError(APIErrors.notFoundError, "Invalid confirmation token", 404);

    if (booking.status !== BookingStatus.PENDING) {
        // Idempotent: if already confirmed, return it. If cancelled, error.
        if (booking.status === BookingStatus.CONFIRMED) return booking;
        throw new ApiError(APIErrors.conflictError, "Booking is already " + booking.status, 409);
    }

    booking.status = BookingStatus.CONFIRMED;
    await bookingRepository.save(booking);
    
    // Create Google Calendar Event (Fire and Forget but save ID if possible)
    createGoogleCalendarEvent(booking.bioId, booking)
        .then(async (event: any) => {
            if (event && event.id) {
                booking.googleCalendarEventId = event.id;
                await bookingRepository.save(booking);
            }
        })
        .catch((err: any) => console.error("Async Calendar Error:", err));

    // Send confirmed email
    const bio = await bioRepository.findOne({ where: { id: booking.bioId } });
    sendBookingConfirmedEmail({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        bookingDate: booking.bookingDate,
        token,
        bioName: bio?.sufix || 'Unknown'
    });
    
    return booking;
};

/**
 * Cancel a booking by token
 */
export const cancelBooking = async (token: string, reason?: string) => {
    const booking = await bookingRepository.findOne({ where: { confirmationToken: token } });
    if (!booking) throw new ApiError(APIErrors.notFoundError, "Invalid token", 404);

    if (booking.status === BookingStatus.CANCELLED) return booking;

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || null;
    
    if (booking.googleCalendarEventId) {
        // Delete from Google Calendar (Fire and Forget)
        deleteGoogleCalendarEvent(booking.bioId, booking.googleCalendarEventId)
            .catch((err: any) => console.error("Async Calendar Delete Error:", err));
    }

    await bookingRepository.save(booking);
    return booking;
};

/**
 * Reschedule a booking to a new date/time
 * @param selfReschedule - If true, customer is rescheduling their own booking (auto-confirm, no email)
 */
export const rescheduleBooking = async (token: string, newDate: string, newTime: string, selfReschedule: boolean = false) => {
    const booking = await bookingRepository.findOne({ 
        where: { confirmationToken: token },
        relations: ['bio']
    });
    if (!booking) throw new ApiError(APIErrors.notFoundError, "Invalid token", 404);

    if (booking.status === BookingStatus.CANCELLED) {
        throw new ApiError(APIErrors.conflictError, "Cannot reschedule a cancelled booking", 409);
    }

    // Check if new slot is available
    const slots = await getAvailableSlots(booking.bioId, newDate);
    if (!slots.includes(newTime)) {
        throw new ApiError(APIErrors.conflictError, "The selected time slot is not available", 409);
    }

    const newBookingDate = parse(`${newDate} ${newTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // Update booking
    booking.bookingDate = newBookingDate;
    
    if (selfReschedule) {
        // Customer rescheduling their own booking - auto-confirm
        booking.status = BookingStatus.CONFIRMED;
        await bookingRepository.save(booking);
        
        // Create Google Calendar Event (Fire and Forget)
        createGoogleCalendarEvent(booking.bioId, booking)
            .then(async (event: any) => {
                if (event && event.id) {
                    booking.googleCalendarEventId = event.id;
                    await bookingRepository.save(booking);
                }
            })
            .catch((err: any) => console.error("Async Calendar Error:", err));

        // Send confirmed email (not confirmation request)
        const bio = await bioRepository.findOne({ where: { id: booking.bioId } });
        sendBookingConfirmedEmail({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            bookingDate: newBookingDate,
            token,
            bioName: bio?.sufix || 'Unknown'
        });
    } else {
        // Owner rescheduling - requires customer confirmation
        booking.status = BookingStatus.PENDING;
        await bookingRepository.save(booking);
        
        // Send confirmation request email
        const bio = await bioRepository.findOne({ where: { id: booking.bioId } });
        sendBookingConfirmationEmail({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            bookingDate: newBookingDate,
            token,
            bioName: bio?.sufix || 'Unknown'
        });
    }

    return booking;
};

/**
 * Get booking by token (for management page)
 */
export const getBookingByToken = async (token: string) => {
    const booking = await bookingRepository.findOne({ 
        where: { confirmationToken: token },
        relations: ['bio', 'bio.user'] // Need bio info to show context
    });
    if (!booking) throw new ApiError(APIErrors.notFoundError, "Booking not found", 404);
    return booking;
};

/**
 * Get all bookings for a bio (Owner view)
 */
/**
 * Get all bookings for a bio (Owner view) with pagination and filtering
 */
export const getBookings = async (bioId: string, page: number = 1, limit: number = 10, status?: string, date?: string) => {
    
    // 1. Lazy Update: Check for confirmed bookings in the past and mark as COMPLETED
    const now = new Date();
    
    await bookingRepository.createQueryBuilder()
        .update(BookingEntity)
        .set({ status: BookingStatus.COMPLETED })
        .where("bioId = :bioId", { bioId })
        .andWhere("status = :status", { status: BookingStatus.CONFIRMED })
        .andWhere("bookingDate < :now", { now })
        .execute();

    // 2. Build Query
    const query = bookingRepository.createQueryBuilder("booking")
        .where("booking.bioId = :bioId", { bioId });

    if (status && status !== 'all') {
        query.andWhere("booking.status = :status", { status });
    }

    if (date) {
        const queryDate = parse(date, 'yyyy-MM-dd', new Date());
        query.andWhere("booking.bookingDate BETWEEN :start AND :end", { 
            start: startOfDay(queryDate), 
            end: endOfDay(queryDate) 
        });
    }

    query.orderBy("booking.bookingDate", date ? "ASC" : "DESC");
    query.skip((page - 1) * limit);
    query.take(limit);

    const [bookings, total] = await query.getManyAndCount();

    return {
        bookings,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};
