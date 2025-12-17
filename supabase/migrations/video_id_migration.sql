-- Add video_id column to activities table
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS video_id text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activities_video_id ON public.activities(video_id);

-- Seed data for Season 1, 2, and 3
DO $$
DECLARE
    item jsonb;
    -- Data extracted from watch-session-view.tsx
    video_data jsonb := '[
        {"title": "Yuru Camp S1 Episode 1", "desc": "Nadeshiko bertemu Rin di Danau Motosu", "vid": "toRv2b-iCs8", "cat": "Anime", "loc": "Danau Motosu"},
        {"title": "Yuru Camp S1 Episode 2", "desc": "Selamat datang di Klub Aktivitas Luar Ruangan!", "vid": "XzE3LL7cbz4", "cat": "Anime", "loc": "Sekolah Motosu"},
        {"title": "Yuru Camp S1 Episode 3", "desc": "Berkemah santai di Fumoto", "vid": "XUyFZeQ1mA0", "cat": "Anime", "loc": "Fumoto"},
        {"title": "Yuru Camp S1 Episode 5", "desc": "Dua perkemahan, pemandangan dua orang", "vid": "ZwFVNv1uGD0", "cat": "Anime", "loc": "Nagano"},
        {"title": "Yuru Camp S1 Episode 6", "desc": "Daging, dedaunan musim gugur, dan danau misterius", "vid": "6Nzofu0TqKs", "cat": "Anime", "loc": "Danau Shibire"},
        {"title": "Yuru Camp S1 Episode 7", "desc": "Malam di tepi danau dan orang-orang di perkemahan", "vid": "H8kC21M1Sxk", "cat": "Anime", "loc": "Danau Shibire"},
        {"title": "Yuru Camp S1 Episode 8", "desc": "Ujian, Caribou, dan Bakpao Lezat", "vid": "Dh8Xp2ReAYg", "cat": "Anime", "loc": "Minobu"},
        {"title": "Yuru Camp S1 Episode 9", "desc": "Malam Navigasi dan Pemandian Air Panas Uap", "vid": "mqprmP-l7GI", "cat": "Anime", "loc": "Nagano"},
        {"title": "Yuru Camp S1 Episode 12", "desc": "Gunung Fuji dan Kamping Yuru", "vid": "aB_FSUGeQQw", "cat": "Anime", "loc": "Fumoto"},
        {"title": "Yuru Camp S2 Episode 1", "desc": "Kari mi instan", "vid": "jycSbANT_qw", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 2", "desc": "Gadis solo camp di malam tahun baru", "vid": "dSfXILVW7yk", "cat": "Anime", "loc": "Shizuoka"},
        {"title": "Yuru Camp S2 Episode 3", "desc": "Lampu Nadeshiko", "vid": "hgOsGfjF0Ys", "cat": "Anime", "loc": "Hamamatsu"},
        {"title": "Yuru Camp S2 Episode 4", "desc": "Hadiah dari Nadeshiko", "vid": "zdyTu-LS4tY", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 5", "desc": "Danau Yamanaka dan Kamping Caribou", "vid": "E4ZNjUcvlEM", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 6", "desc": "Puncak Musim Dingin", "vid": "vYH9nYc81_U", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 7", "desc": "Nadeshiko Solo Camp", "vid": "QHrfjTR88Ok", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 8", "desc": "Kamping Solo Nadeshiko", "vid": "B7Hv8unabNw", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S2 Episode 9", "desc": "Akhir Musim Dingin", "vid": "-8dJqdzT_XU", "cat": "Anime", "loc": "Izu"},
        {"title": "Yuru Camp S2 Episode 10", "desc": "Kamping Izu!", "vid": "MAPbaAK7XRs", "cat": "Anime", "loc": "Izu"},
        {"title": "Yuru Camp S2 Episode 11", "desc": "Kamping Izu Lanjut!", "vid": "I0U7RhL4CiE", "cat": "Anime", "loc": "Izu"},
        {"title": "Yuru Camp S2 Episode 12", "desc": "Kamping Izu Selesai!", "vid": "93S5Hsa8-gc", "cat": "Anime", "loc": "Izu"},
        {"title": "Yuru Camp S2 Episode 13", "desc": "Pulang", "vid": "H2Pp8oAfXJY", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 1", "desc": "Musim Baru", "vid": "SGs03IvU7SQ", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 2", "desc": "Kamping Taman", "vid": "7LuhosSqSwA", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 3", "desc": "Jalan-jalan", "vid": "oDN1ph1F5uA", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 4", "desc": "Kereta Api", "vid": "3VnyX9fCHQ8", "cat": "Anime", "loc": "Aichi"},
        {"title": "Yuru Camp S3 Episode 5", "desc": "Kamping Danau", "vid": "Z3Ab0-4C5og", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 6", "desc": "Foto Kenangan", "vid": "96MgAZblVtE", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 7", "desc": "Retro", "vid": "New86X5qoyo", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 8", "desc": "Festival", "vid": "cSjTrH1B4LA", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 9", "desc": "Sakura", "vid": "ScAD90TBtQk", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 10", "desc": "Kereta Gantung", "vid": "GR8iFH43vVI", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 11", "desc": "Kenangan", "vid": "JsGCvzgLQSQ", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp S3 Episode 12", "desc": "Akhir Tahun", "vid": "52lGGBLFokU", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp OVA 1", "desc": "Spesial 1", "vid": "yrI9orwLXIo", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp OVA 2", "desc": "Spesial 2", "vid": "AHnXBtTbMic", "cat": "Anime", "loc": "Yamanashi"},
        {"title": "Yuru Camp OVA 3", "desc": "Spesial 3", "vid": "ih_Io3cYLgU", "cat": "Anime", "loc": "Yamanashi"}
    ]';
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(video_data)
    LOOP
        -- Insert only if video_id doesn''t exist
        IF NOT EXISTS (SELECT 1 FROM public.activities WHERE video_id = item->>'vid') THEN
            INSERT INTO public.activities (
                title, 
                description, 
                category, 
                location, 
                video_id,
                image_url,
                date
            ) VALUES (
                item->>'title',
                item->>'desc',
                item->>'cat',
                item->>'loc',
                item->>'vid',
                'https://img.youtube.com/vi/' || (item->>'vid') || '/maxresdefault.jpg',
                CURRENT_DATE
            );
        END IF;
    END LOOP;
END $$;
