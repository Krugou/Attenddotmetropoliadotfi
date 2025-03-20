ALTER TABLE `work_log_practicum`
ADD COLUMN `userid` INT(11) NULL AFTER `description`,
ADD CONSTRAINT `work_log_practicum_ibfk_1`
FOREIGN KEY (`userid`) REFERENCES `users`(`userid`) ON DELETE SET NULL;
