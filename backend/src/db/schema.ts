import { pgTable, uuid, text, timestamp, date, numeric, integer, primaryKey, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { generateId } from '../utils/id';

// Renamed from profiles to users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    email: text('email').unique().notNull(),
    googleId: text('google_id').unique(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    phone: text('phone'),
    role: text('role').default('user').notNull(),
    exp: integer('exp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    regionId: uuid('region_id').references(() => regions.id), // References regions
});

export const regions = pgTable('regions', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    coverUrl: text('cover_url'),
    status: text('status').default('active').notNull(), // 'pending', 'active', 'rejected'
    socialLinks: text('social_links'), // JSON string for flexibility
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const regionMembers = pgTable('region_members', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    regionId: uuid('region_id').references(() => regions.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    role: text('role').default('member').notNull(), // 'member', 'admin'
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const activities = pgTable('activities', {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
    title: text('title').notNull(),
    description: text('description'),
    categoryId: uuid('category_id').references(() => categories.id),
    date: date('date'),
    location: text('location'),
    imageUrl: text('image_url'),
    additionalImages: text('additional_images').array(),
    userId: uuid('user_id').references(() => users.id), // References users
    regionId: uuid('region_id').references(() => regions.id), // References regions
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const campAreas = pgTable('camp_areas', {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
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
    activityId: text('activity_id').references(() => activities.id, { onDelete: 'cascade' }),
    videoId: text('video_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const activityComments = pgTable('activity_comments', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    activityId: text('activity_id').references(() => activities.id, { onDelete: 'cascade' }),
    videoId: text('video_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const events = pgTable('events', {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
    title: text('title').notNull(),
    description: text('description'),
    location: text('location').notNull(),
    dateStart: timestamp('date_start', { withTimezone: true, mode: 'string' }).notNull(),
    dateEnd: timestamp('date_end', { withTimezone: true, mode: 'string' }),
    imageUrl: text('image_url'),
    price: numeric('price').default('0'),
    maxParticipants: integer('max_participants'),
    organizerId: uuid('organizer_id').references(() => users.id, { onDelete: 'set null' }), // References users
    regionId: uuid('region_id').references(() => regions.id), // References regions
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const eventParticipants = pgTable('event_participants', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // References users
    seatCount: integer('seat_count').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const gearLists = pgTable('gear_lists', {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const gearCategories = pgTable('gear_categories', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    gearListId: text('gear_list_id').references(() => gearLists.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const gearItems = pgTable('gear_items', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    categoryId: uuid('category_id').references(() => gearCategories.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    weight: numeric('weight').default('0'),
    quantity: integer('quantity').default(1).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});
