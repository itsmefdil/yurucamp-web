-- Create activities table
create table if not exists public.activities (
    id uuid not null default gen_random_uuid(),
    title text not null,
    description text,
    category text,
    date date,
    location text,
    image_url text,
    additional_images text [],
    user_id uuid references public.profiles(id),
    created_at timestamptz default now(),
    constraint activities_pkey primary key (id)
);
-- Set up Row Level Security (RLS)
alter table public.activities enable row level security;
-- Create policies
create policy "Public activities are viewable by everyone." on public.activities for
select using (true);
create policy "Users can insert their own activities." on public.activities for
insert with check (auth.uid() = user_id);
create policy "Users can update their own activities." on public.activities for
update using (auth.uid() = user_id);
create policy "Users can delete their own activities." on public.activities for delete using (auth.uid() = user_id);