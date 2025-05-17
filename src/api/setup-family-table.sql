
-- Add family table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS family (
  family_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default family if not exists
INSERT INTO family (name) 
SELECT 'Default Family' 
WHERE NOT EXISTS (SELECT * FROM family WHERE family_id = 1);

-- Add family_id column to family_members if it doesn't exist
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS family_id INT DEFAULT 1,
ADD CONSTRAINT fk_family FOREIGN KEY (family_id) REFERENCES family(family_id);

-- Update existing family members to have the default family ID if not set
UPDATE family_members SET family_id = 1 WHERE family_id IS NULL;
