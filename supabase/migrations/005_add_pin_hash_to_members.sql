-- Add pin_hash column to members table.
-- Nullable because existing members will not have a PIN until one is set by a librarian.
ALTER TABLE members ADD COLUMN pin_hash VARCHAR(64);
