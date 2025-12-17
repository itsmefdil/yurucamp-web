-- Create event_participants table
create table if not exists public.event_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- Enable RLS
alter table public.event_participants enable row level security;

-- Policies

-- Everyone can view participants (to show count/avatars)
create policy "Event participants are viewable by everyone."
  on public.event_participants for select
  using ( true );

-- Users can join (insert)
create policy "Users can join events."
  on public.event_participants for insert
  with check ( auth.uid() = user_id );

-- Users can leave (delete)
create policy "Users can leave events."
  on public.event_participants for delete
  using ( auth.uid() = user_id );
