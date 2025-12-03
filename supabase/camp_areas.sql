-- Create camp_areas table
create table if not exists public.camp_areas (
    id uuid not null default gen_random_uuid(),
    name text not null,
    description text,
    location text,
    price numeric,
    image_url text,
    additional_images text [],
    facilities text [],
    -- array of strings
    user_id uuid references public.profiles(id),
    created_at timestamptz default now(),
    constraint camp_areas_pkey primary key (id)
);
-- Set up Row Level Security (RLS)
alter table public.camp_areas enable row level security;
-- Create policies
create policy "Public camp areas are viewable by everyone." on public.camp_areas for
select using (true);
create policy "Users can insert their own camp areas." on public.camp_areas for
insert with check (auth.uid() = user_id);
create policy "Users can update their own camp areas." on public.camp_areas for
update using (auth.uid() = user_id);
create policy "Users can delete their own camp areas." on public.camp_areas for delete using (auth.uid() = user_id);