-- Create events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text not null,
  date_start timestamp with time zone not null,
  date_end timestamp with time zone,
  image_url text,
  price numeric default 0,
  max_participants integer,
  organizer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- Policies
create policy "Public events are viewable by everyone."
  on public.events for select
  using ( true );

create policy "Users can create events."
  on public.events for insert
  with check ( auth.uid() = organizer_id );

create policy "Users can update their own events."
  on public.events for update
  using ( auth.uid() = organizer_id );

create policy "Users can delete their own events."
  on public.events for delete
  using ( auth.uid() = organizer_id );
