-- Create activity_likes table
create table if not exists public.activity_likes (
    id uuid not null default gen_random_uuid(),
    activity_id uuid not null references public.activities(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz default now(),
    constraint activity_likes_pkey primary key (id),
    constraint activity_likes_unique_user_activity unique (user_id, activity_id)
);
-- Create activity_comments table
create table if not exists public.activity_comments (
    id uuid not null default gen_random_uuid(),
    activity_id uuid not null references public.activities(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint activity_comments_pkey primary key (id)
);
-- Enable RLS
alter table public.activity_likes enable row level security;
alter table public.activity_comments enable row level security;
-- Policies for likes
create policy "Likes are viewable by everyone." on public.activity_likes for
select using (true);
create policy "Users can insert their own likes." on public.activity_likes for
insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes." on public.activity_likes for delete using (auth.uid() = user_id);
-- Policies for comments
create policy "Comments are viewable by everyone." on public.activity_comments for
select using (true);
create policy "Users can insert their own comments." on public.activity_comments for
insert with check (auth.uid() = user_id);
create policy "Users can update their own comments." on public.activity_comments for
update using (auth.uid() = user_id);
create policy "Users can delete their own comments." on public.activity_comments for delete using (auth.uid() = user_id);