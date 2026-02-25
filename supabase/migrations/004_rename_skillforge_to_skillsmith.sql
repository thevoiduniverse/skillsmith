-- Rename all "SkillForge" references to "SkillSmith" in live data
-- Covers: system profile display name, system user email, and template skill content

-- Update system profile display name
UPDATE profiles
SET display_name = 'SkillSmith'
WHERE id = '00000000-0000-0000-0000-000000000000'
  AND display_name = 'SkillForge';

-- Update system user email
UPDATE auth.users
SET email = 'system@skillsmith.internal'
WHERE id = '00000000-0000-0000-0000-000000000000'
  AND email = 'system@skillforge.internal';

-- Update "author: SkillForge" inside template skill content
UPDATE skills
SET content = REPLACE(content, 'author: SkillForge', 'author: SkillSmith')
WHERE content LIKE '%author: SkillForge%';
