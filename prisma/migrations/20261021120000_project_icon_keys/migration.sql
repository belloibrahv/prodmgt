-- Projects now store a Lucide icon key instead of an emoji.
ALTER TABLE "projects" ALTER COLUMN "emoji" SET DEFAULT 'folder';

UPDATE "projects" SET "emoji" = CASE "emoji"
  WHEN '📁' THEN 'folder'
  WHEN '🚀' THEN 'rocket'
  WHEN '💡' THEN 'lightbulb'
  WHEN '🏢' THEN 'building'
  WHEN '📱' THEN 'smartphone'
  WHEN '🛒' THEN 'cart'
  WHEN '📊' THEN 'chart'
  WHEN '🎯' THEN 'target'
  WHEN '⚙️' THEN 'cog'
  WHEN '⚙' THEN 'cog'
  WHEN '🔬' THEN 'microscope'
  WHEN '🎨' THEN 'palette'
  WHEN '📝' THEN 'document'
  WHEN '🌐' THEN 'globe'
  WHEN '💳' THEN 'payments'
  ELSE 'folder'
END
WHERE "emoji" NOT IN ('folder', 'rocket', 'lightbulb', 'building', 'smartphone', 'cart', 'chart',
  'target', 'cog', 'microscope', 'palette', 'document', 'globe', 'payments');
