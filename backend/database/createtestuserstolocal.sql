-- Create 100 fake student users for testing purposes
-- This script is compatible with MariaDB and follows jaksec.sql schema

-- Set client_encoding for PostgreSQL/MySQL compatibility
SET NAMES utf8mb4;

-- Declare variables for batch insertion
-- Using MariaDB stored procedure syntax
DELIMITER //
CREATE PROCEDURE create_test_users()
BEGIN
  -- Define common Finnish first and last names for realistic test data
  DECLARE i INT DEFAULT 1;
  DECLARE random_first_name VARCHAR(100);
  DECLARE random_last_name VARCHAR(100);
  DECLARE student_email VARCHAR(100);
  DECLARE student_number INT;
  DECLARE username VARCHAR(20);
  DECLARE created_timestamp TIMESTAMP;
  DECLARE random_index INT;

  -- Arrays for first and last names implemented as temporary tables
  CREATE TEMPORARY TABLE first_names (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
  );

  CREATE TEMPORARY TABLE last_names (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
  );

  -- Insert first names
  INSERT INTO first_names (name) VALUES
    ('Juhani'), ('Mikko'), ('Antti'), ('Matti'), ('Ville'), ('Juha'), ('Pekka'), ('Timo'), ('Sami'), ('Heikki'),
    ('Maria'), ('Laura'), ('Anna'), ('Sofia'), ('Emilia'), ('Johanna'), ('Katariina'), ('Elina'), ('Susanna'), ('Riikka');

  -- Insert last names
  INSERT INTO last_names (name) VALUES
    ('Virtanen'), ('Korhonen'), ('Nieminen'), ('Mäkinen'), ('Hämäläinen'), ('Laine'), ('Koskinen'), ('Heikkinen'),
    ('Järvinen'), ('Lehtonen'), ('Salminen'), ('Saarinen'), ('Turunen'), ('Laitinen'), ('Tuominen');

  -- Loop to create 100 students
  WHILE i <= 100 DO
    -- Generate random first and last name
    SET random_index = FLOOR(1 + RAND() * (SELECT COUNT(*) FROM first_names));
    SELECT name INTO random_first_name FROM first_names WHERE id = random_index;

    SET random_index = FLOOR(1 + RAND() * (SELECT COUNT(*) FROM last_names));
    SELECT name INTO random_last_name FROM last_names WHERE id = random_index;

    -- Generate student email with Metropolia domain
    SET student_email = LOWER(CONCAT(random_first_name, '.', random_last_name, i, '@metropolia.fi'));

    -- Generate username (first letter of first name + last name + number)
    SET username = LOWER(CONCAT(SUBSTRING(random_first_name, 1, 1), random_last_name, i));

    -- Generate student number as integer
    SET student_number = 100000 + i;

    -- Generate random created_at timestamp within the last year
    SET created_timestamp = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY);

    -- Insert the student into the users table according to jaksec.sql schema
    INSERT INTO users (
      username,
      email,
      staff,
      first_name,
      last_name,
      created_at,
      studentnumber,
      roleid,
      GDPR,
      darkMode,
      language,
      activeStatus
    ) VALUES (
      username,
      student_email,
      0, -- Not staff
      random_first_name,
      random_last_name,
      created_timestamp,
      student_number,
      1, -- roleid = 1 for student
      1, -- GDPR accepted
      IF(RAND() > 0.5, 1, 0), -- Random dark mode preference
      CASE
        WHEN RAND() < 0.7 THEN 'fi'
        WHEN RAND() < 0.9 THEN 'en'
        ELSE 'sv'
      END, -- Language distribution
      1  -- Active
    );

    -- Log progress (MariaDB doesn't have RAISE NOTICE, using SELECT instead)
    SELECT CONCAT('Created student ', i, ': ', random_first_name, ' ', random_last_name, ' (', student_email, ')') AS progress;

    SET i = i + 1;
  END WHILE;

  -- Clean up temporary tables
  DROP TEMPORARY TABLE IF EXISTS first_names;
  DROP TEMPORARY TABLE IF EXISTS last_names;

  -- Final success message
  SELECT 'Successfully created 100 test student accounts' AS result;
END //
DELIMITER ;

-- Execute the procedure
CALL create_test_users();

-- Clean up the procedure after use
DROP PROCEDURE IF EXISTS create_test_users;

-- Verify the number of student users
SELECT COUNT(*) AS total_test_students FROM users WHERE roleid = 1;
