-- Step 1: Add category_id column
ALTER TABLE "activities" ADD COLUMN "category_id" uuid;

-- Step 2: Add foreign key constraint
ALTER TABLE "activities" ADD CONSTRAINT "activities_category_id_categories_id_fk" 
FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;

-- Step 3: Migrate data from category (text) to category_id (uuid)
-- Camping
UPDATE activities 
SET category_id = (SELECT id FROM categories WHERE name = 'Camping')
WHERE LOWER(category) = 'camping';

-- Hiking
UPDATE activities 
SET category_id = (SELECT id FROM categories WHERE name = 'Hiking')
WHERE LOWER(category) = 'hiking';

-- Fishing
UPDATE activities 
SET category_id = (SELECT id FROM categories WHERE name = 'Fishing')
WHERE LOWER(category) = 'fishing';

-- Glamping
UPDATE activities 
SET category_id = (SELECT id FROM categories WHERE name = 'Glamping')
WHERE LOWER(category) = 'glamping';

-- Other
UPDATE activities 
SET category_id = (SELECT id FROM categories WHERE name = 'Other')
WHERE LOWER(category) = 'other' OR LOWER(category) = 'lainnya';

-- Step 4: Drop old category column
ALTER TABLE "activities" DROP COLUMN IF EXISTS "category";