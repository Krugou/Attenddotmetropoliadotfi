-- --------------------------------------------------------
-- Verkkotietokone:              127.0.0.1
-- Palvelinversio:               10.11.0-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Versio:              11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

drop database if exists jaksec;
-- Dumping database structure for jaksec
CREATE DATABASE IF NOT EXISTS `jaksec` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `jaksec`;

-- Dumping structure for taulu jaksec.attendance
CREATE TABLE IF NOT EXISTS `attendance` (
  `status` int(11) NOT NULL,
  `date` date NOT NULL,
  `attendanceid` int(11) NOT NULL AUTO_INCREMENT,
  `usercourseid` int(11) NOT NULL,
  `lectureid` int(11) NOT NULL,
  PRIMARY KEY (`attendanceid`),
  KEY `usercourseid` (`usercourseid`),
  KEY `lectureid` (`lectureid`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`usercourseid`) REFERENCES `usercourses` (`usercourseid`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`lectureid`) REFERENCES `lecture` (`lectureid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.attendance: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.lecture
CREATE TABLE IF NOT EXISTS `lecture` (
  `lectureid` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `timeofday` enum('am', 'pm') NOT NULL,
  `topicid` int(11) NOT NULL,
  `courseid` int(11) NOT NULL,
  `state` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  PRIMARY KEY (`lectureid`),
  KEY `topicid` (`topicid`),
  KEY `courseid` (`courseid`),
  CONSTRAINT `lecture_ibfk_1` FOREIGN KEY (`topicid`) REFERENCES `topics` (`topicid`),
  CONSTRAINT `lecture_ibfk_2` FOREIGN KEY (`courseid`) REFERENCES `courses` (`courseid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



-- Dumping data for table jaksec.lecture: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `lecture` DISABLE KEYS */;
/*!40000 ALTER TABLE `lecture` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.courseinstructors
CREATE TABLE IF NOT EXISTS `courseinstructors` (
  `courseid` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  KEY `courseid` (`courseid`),
  KEY `userid` (`userid`),
  CONSTRAINT `courseinstructors_ibfk_1` FOREIGN KEY (`courseid`) REFERENCES `courses` (`courseid`) ON DELETE CASCADE,
  CONSTRAINT `courseinstructors_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.courseinstructors: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `courseinstructors` DISABLE KEYS */;
/*!40000 ALTER TABLE `courseinstructors` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.courses
CREATE TABLE IF NOT EXISTS `courses` (
  `courseid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `end_date` date NOT NULL,
  `code` varchar(20) NOT NULL,
  `studentgroupid` int(11) DEFAULT NULL,
  PRIMARY KEY (`courseid`),
  KEY `studentgroupid` (`studentgroupid`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`studentgroupid`) REFERENCES `studentgroups` (`studentgroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.courses: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.coursetopics
CREATE TABLE IF NOT EXISTS `coursetopics` (
  `courseid` int(11) NOT NULL,
  `topicid` int(11) NOT NULL,
  KEY `courseid` (`courseid`),
  KEY `topicid` (`topicid`),
  CONSTRAINT `coursetopics_ibfk_1` FOREIGN KEY (`courseid`) REFERENCES `courses` (`courseid`) ON DELETE CASCADE,
  CONSTRAINT `coursetopics_ibfk_2` FOREIGN KEY (`topicid`) REFERENCES `topics` (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.coursetopics: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `coursetopics` DISABLE KEYS */;
/*!40000 ALTER TABLE `coursetopics` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `roleid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`roleid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.roles: ~4 rows (suunnilleen)
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`roleid`, `name`) VALUES
	(1, 'student'),
	(2, 'counselor'),
	(3, 'teacher'),
	(4, 'admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.studentgroups
CREATE TABLE IF NOT EXISTS `studentgroups` (
  `studentgroupid` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(20) NOT NULL,
  PRIMARY KEY (`studentgroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.studentgroups: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `studentgroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `studentgroups` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.topicgroups
CREATE TABLE IF NOT EXISTS `topicgroups` (
  `topicgroupid` int(11) NOT NULL AUTO_INCREMENT,
  `topicgroupname` varchar(100) NOT NULL,
  `userid` int(11) DEFAULT NULL,
  KEY `userid` (`userid`),
  CONSTRAINT `topicgroups_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`),
  PRIMARY KEY (`topicgroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.topicgroups: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `topicgroups` DISABLE KEYS */;
/*!40000 ALTER TABLE `topicgroups` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.topics
CREATE TABLE IF NOT EXISTS `topics` (
  `topicid` int(11) NOT NULL AUTO_INCREMENT,
  `topicname` varchar(64) NOT NULL,
  PRIMARY KEY (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.topics: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.topicsingroup
CREATE TABLE IF NOT EXISTS `topicsingroup` (
  `topicgroupid` int(11) NOT NULL,
  `topicid` int(11) NOT NULL,
  KEY `topicgroupid` (`topicgroupid`),
  KEY `topicid` (`topicid`),
  CONSTRAINT `topicsingroup_ibfk_1` FOREIGN KEY (`topicgroupid`) REFERENCES `topicgroups` (`topicgroupid`),
  CONSTRAINT `topicsingroup_ibfk_2` FOREIGN KEY (`topicid`) REFERENCES `topics` (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.topicsingroup: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `topicsingroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `topicsingroup` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.usercourses
CREATE TABLE IF NOT EXISTS `usercourses` (
  `usercourseid` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `courseid` int(11) NOT NULL,
  PRIMARY KEY (`usercourseid`),
  KEY `userid` (`userid`),
  KEY `courseid` (`courseid`),
  CONSTRAINT `usercourses_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`),
  CONSTRAINT `usercourses_ibfk_2` FOREIGN KEY (`courseid`) REFERENCES `courses` (`courseid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.usercourses: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `usercourses` DISABLE KEYS */;
/*!40000 ALTER TABLE `usercourses` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.usercourse_topics
CREATE TABLE IF NOT EXISTS `usercourse_topics` (
  `usercourseid` int(11) NOT NULL,
  `topicid` int(11) NOT NULL,
  KEY `usercourseid` (`usercourseid`),
  KEY `topicid` (`topicid`),
  CONSTRAINT `usercourse_topics_ibfk_1` FOREIGN KEY (`usercourseid`) REFERENCES `usercourses` (`usercourseid`),
  CONSTRAINT `usercourse_topics_ibfk_2` FOREIGN KEY (`topicid`) REFERENCES `topics` (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.usercourse_topics: ~0 rows (suunnilleen)
/*!40000 ALTER TABLE `usercourse_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `usercourse_topics` ENABLE KEYS */;

-- Dumping structure for taulu jaksec.users
CREATE TABLE IF NOT EXISTS `users` (
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20),
  `email` varchar(100) NOT NULL,
  `staff` int(11) NOT NULL DEFAULT 0,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `studentnumber` int(11) DEFAULT NULL,
  `studentgroupid` int(11) DEFAULT NULL,
  `roleid` int(11) NOT NULL DEFAULT 1,
  `GDPR` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userid`),
  KEY `studentgroupid` (`studentgroupid`),
  KEY `roleid` (`roleid`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`studentgroupid`) REFERENCES `studentgroups` (`studentgroupid`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`roleid`) REFERENCES `roles` (`roleid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Dumping data for table jaksec.users: ~6 rows (suunnilleen)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`userid`, `username`, `email`, `staff`, `first_name`, `last_name`, `created_at`, `studentnumber`, `studentgroupid`, `roleid`, `GDPR`) VALUES
    (1, 'MrAnderson', 'mr.anderson@example.com', 1, 'Mr', 'Anderson', NOW(), NULL, NULL, 4, 1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;


/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- Insert the group
INSERT INTO `topicgroups` (`topicgroupname`) VALUES ('All');

-- Get the ID of the group you just inserted
SET @groupID = LAST_INSERT_ID();

-- Insert the topics
INSERT INTO `topics` (`topicname`) VALUES ('Math'), ('Physics'), ('Programming');

-- Get the IDs of the topics you just inserted
SET @mathID = (SELECT `topicid` FROM `topics` WHERE `topicname` = 'Math');
SET @physicsID = (SELECT `topicid` FROM `topics` WHERE `topicname` = 'Physics');
SET @programmingID = (SELECT `topicid` FROM `topics` WHERE `topicname` = 'Programming');

-- Create the associations
INSERT INTO `topicsingroup` (`topicgroupid`, `topicid`) VALUES (@groupID, @mathID), (@groupID, @physicsID), (@groupID, @programmingID);

-- Insert the second group
INSERT INTO `topicgroups` (`topicgroupname`) VALUES ('MathPhysics');

-- Get the ID of the second group you just inserted
SET @secondGroupID = LAST_INSERT_ID();

-- The topics "Math" and "Physics" are already in the `topics` table, so we just need to get their IDs
-- We already have the IDs from the previous commands, but if you need to get them again, you can use these commands:
SET @mathID = (SELECT `topicid` FROM `topics` WHERE `topicname` = 'Math');
SET @physicsID = (SELECT `topicid` FROM `topics` WHERE `topicname` = 'Physics');

-- Create the associations for the second group
INSERT INTO `topicsingroup` (`topicgroupid`, `topicid`) VALUES (@secondGroupID, @mathID), (@secondGroupID, @physicsID);


-- Create the serversettings table
CREATE TABLE `serversettings` (
  `speedofhash` INT,
  `leewayspeed` INT,
  `timeouttime` INT,
  `attendancethreshold` INT
  
);

-- Insert the values into the serversettings table
INSERT INTO `serversettings` (`speedofhash`, `leewayspeed`, `timeouttime`, `attendancethreshold`) VALUES (5000, 4, 3600000 , 80 );
