-- Drop existing constraints and columns
ALTER TABLE `users`
DROP FOREIGN KEY IF EXISTS `users_ibfk_3`,
DROP COLUMN IF EXISTS `darkMode`,
DROP COLUMN IF EXISTS `language`,
DROP COLUMN IF EXISTS `activeStatus`;

-- Create languages table with only id
DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `languageid` varchar(2) NOT NULL,
  PRIMARY KEY (`languageid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Insert default language codes
INSERT INTO `languages` (`languageid`) VALUES
  ('en'),
  ('fi'),
  ('sv');

-- Add new columns and constraints to users
ALTER TABLE `users`
ADD COLUMN `darkMode` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `language` varchar(2) NOT NULL DEFAULT 'en',
ADD COLUMN `activeStatus` TINYINT(1) NOT NULL DEFAULT 1,
ADD INDEX `idx_users_language` (`language`),
ADD CONSTRAINT `fk_users_languages`
FOREIGN KEY (`language`)
REFERENCES `languages` (`languageid`)
ON UPDATE CASCADE;