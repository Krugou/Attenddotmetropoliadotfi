   CREATE TABLE IF NOT EXISTS `work_log_practicum` (
     `work_log_practicum_id` INT(11) NOT NULL AUTO_INCREMENT,
     `name` VARCHAR(100) NOT NULL,
     `start_date` DATE NOT NULL,
     `end_date` DATE NOT NULL,
     `description` TEXT NOT NULL,
     `required_hours` INT(11) NOT NULL,
     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     PRIMARY KEY (`work_log_practicum_id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `work_log_entries`
DROP FOREIGN KEY `work_log_entries_ibfk_2`;

-- 3. Modify the work_log_entries table
ALTER TABLE `work_log_entries`
    MODIFY COLUMN `work_log_course_id` INT(11) NULL,
    ADD COLUMN `work_log_practicum_id` INT(11) NULL AFTER `work_log_course_id`;

-- 4. Add new foreign key constraints
ALTER TABLE `work_log_entries`
    ADD CONSTRAINT `work_log_entries_ibfk_2`
    FOREIGN KEY (`work_log_course_id`)
    REFERENCES `work_log_courses`(`work_log_course_id`)
    ON DELETE CASCADE,
    ADD CONSTRAINT `work_log_entries_ibfk_3`
    FOREIGN KEY (`work_log_practicum_id`)
    REFERENCES `work_log_practicum`(`work_log_practicum_id`)
    ON DELETE CASCADE;

-- 5. Add the constraint to ensure entry belongs to either course OR practicum
ALTER TABLE `work_log_entries`
ADD CONSTRAINT `work_log_entries_type_check`
CHECK (
    (`work_log_course_id` IS NOT NULL AND `work_log_practicum_id` IS NULL) OR
    (`work_log_course_id` IS NULL AND `work_log_practicum_id` IS NOT NULL)
);

-- Creating a table to manage instructors for work log practicums
CREATE TABLE IF NOT EXISTS `work_log_practicum_instructors` (
  `instructor_id` INT(11) NOT NULL AUTO_INCREMENT,
  `userid` INT(11) NOT NULL,
  `work_log_practicum_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`instructor_id`),
  CONSTRAINT `work_log_practicum_instructors_ibfk_1` FOREIGN KEY (`userid`)
      REFERENCES `users`(`userid`) ON DELETE CASCADE,
  CONSTRAINT `work_log_practicum_instructors_ibfk_2` FOREIGN KEY (`work_log_practicum_id`)
      REFERENCES `work_log_practicum`(`work_log_practicum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
