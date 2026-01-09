import { pgTable, uuid, text, timestamp, date, numeric, integer, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Renamed from profiles to users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    email: text('email').unique().notNull(),
    googleId: text('google_id').unique(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    phone: text('phone'),
});

export const activities = pgTable('activities', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category'),
    date: date('date'),
    location: text('location'),
    imageUrl: text('image_url'),
    additionalImages: text('additional_images').array(),
    userId: uuid('user_id').references(() => users.id), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const campAreas = pgTable('camp_areas', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    location: text('location'),
    price: numeric('price'),
    imageUrl: text('image_url'),
    additionalImages: text('additional_images').array(),
    facilities: text('facilities').array(),
    userId: uuid('user_id').references(() => users.id), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const activityLikes = pgTable('activity_likes', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'cascade' }),
    videoId: text('video_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const activityComments = pgTable('activity_comments', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'cascade' }),
    videoId: text('video_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    title: text('title').notNull(),
    description: text('description'),
    location: text('location').notNull(),
    dateStart: timestamp('date_start', { withTimezone: true, mode: 'string' }).notNull(),
    dateEnd: timestamp('date_end', { withTimezone: true, mode: 'string' }),
    imageUrl: text('image_url'),
    price: numeric('price').default('0'),
    maxParticipants: integer('max_participants'),
    organizerId: uuid('organizer_id').references(() => users.id, { onDelete: 'set null' }), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const eventParticipants = pgTable('event_participants', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});
