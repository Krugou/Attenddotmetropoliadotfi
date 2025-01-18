   -- Creating a table for work log specific courses
   CREATE TABLE IF NOT EXISTS `work_log_courses` (
     `work_log_course_id` INT(11) NOT NULL AUTO_INCREMENT,
     `name` VARCHAR(100) NOT NULL,
     `start_date` DATE NOT NULL,
     `end_date` DATE NOT NULL,
     `code` VARCHAR(20) NOT NULL UNIQUE,
     `description` TEXT NOT NULL,
     `required_hours` INT(11) NOT NULL,
     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     PRIMARY KEY (`work_log_course_id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

   -- Creating a new table to record work log entries specific to work log courses
   CREATE TABLE IF NOT EXISTS `work_log_entries` (
     `entry_id` INT(11) NOT NULL AUTO_INCREMENT,
     `userid` INT(11) NOT NULL,
     `work_log_course_id` INT(11) NOT NULL,
     `start_time` DATETIME NOT NULL,
     `end_time` DATETIME NOT NULL,
     `description` TEXT NOT NULL,
     `status` ENUM('0', '1', '2', '3') NOT NULL DEFAULT '0',
     PRIMARY KEY (`entry_id`),
     CONSTRAINT `work_log_entries_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users`(`userid`) ON DELETE CASCADE,
     CONSTRAINT `work_log_entries_ibfk_2` FOREIGN KEY (`work_log_course_id`) REFERENCES `work_log_courses`(`work_log_course_id`) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

   -- Creating a table to manage which users are part of work log courses
   CREATE TABLE IF NOT EXISTS `work_log_course_users` (
     `user_course_id` INT(11) NOT NULL AUTO_INCREMENT,
     `userid` INT(11) NOT NULL,
     `work_log_course_id` INT(11) NOT NULL,
     PRIMARY KEY (`user_course_id`),
     CONSTRAINT `work_log_course_users_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users`(`userid`) ON DELETE CASCADE,
     CONSTRAINT `work_log_course_users_ibfk_2` FOREIGN KEY (`work_log_course_id`) REFERENCES `work_log_courses`(`work_log_course_id`) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

   -- Optionally add a table to manage student groups within work log courses
   CREATE TABLE IF NOT EXISTS `work_log_course_groups` (
     `group_id` INT(11) NOT NULL AUTO_INCREMENT,
     `work_log_course_id` INT(11) NOT NULL,
     `group_name` VARCHAR(100) NOT NULL,
     PRIMARY KEY (`group_id`),
     CONSTRAINT `work_log_course_groups_ibfk_1` FOREIGN KEY (`work_log_course_id`) REFERENCES `work_log_courses`(`work_log_course_id`) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

   -- Creating a table to assign students to groups in work log courses
   CREATE TABLE IF NOT EXISTS `student_group_assignments` (
     `assignment_id` INT(11) NOT NULL AUTO_INCREMENT,
     `group_id` INT(11) NOT NULL,
     `userid` INT(11) NOT NULL,
     PRIMARY KEY (`assignment_id`),
     FOREIGN KEY (`group_id`) REFERENCES `work_log_course_groups`(`group_id`) ON DELETE CASCADE,
     FOREIGN KEY (`userid`) REFERENCES `users`(`userid`) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;