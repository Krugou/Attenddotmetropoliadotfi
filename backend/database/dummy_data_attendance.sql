DELIMITER $$

DROP PROCEDURE IF EXISTS seed_teacher_students_g25443 $$
CREATE PROCEDURE seed_teacher_students_g25443(
  IN p_teacher_email VARCHAR(100),
  IN p_group_name VARCHAR(20),
  IN p_lectures_per_course INT
)
BEGIN
  DECLARE v_teacher_userid INT DEFAULT NULL;
  DECLARE v_courseid INT DEFAULT NULL;
  DECLARE v_studentgroupid INT DEFAULT NULL;
  DECLARE v_topicid INT DEFAULT NULL;

  DECLARE v_fn VARCHAR(100);
  DECLARE v_ln VARCHAR(100);
  DECLARE v_email_local VARCHAR(120);
  DECLARE v_sn INT;

  DECLARE v_email VARCHAR(160);
  DECLARE v_student_userid INT DEFAULT NULL;
  DECLARE v_usercourseid INT DEFAULT NULL;

  DECLARE v_uname_base VARCHAR(40);
  DECLARE v_uname_try VARCHAR(40);

  DECLARE v_base_student_userid INT DEFAULT NULL;

  DECLARE l INT DEFAULT 1;
  DECLARE v_lecture_start DATE;
  DECLARE v_lectureid INT DEFAULT NULL;

  DECLARE cur_done INT DEFAULT 0;

  -- Students dataset (ASCII, no ä/ö to avoid charset issues)
  DECLARE cur_students CURSOR FOR
    SELECT 'Aino','Korhonen','aino.korhonen',200101 UNION ALL
    SELECT 'Eetu','Virtanen','eetu.virtanen',200102 UNION ALL
    SELECT 'Oona','Makinen','oona.makinen',200103 UNION ALL
    SELECT 'Veeti','Nieminen','veeti.nieminen',200104 UNION ALL
    SELECT 'Emilia','Hamalainen','emilia.hamalainen',200105 UNION ALL
    SELECT 'Leo','Heikkinen','leo.heikkinen',200106 UNION ALL
    SELECT 'Sanni','Laine','sanni.laine',200107 UNION ALL
    SELECT 'Aleksi','Lehtonen','aleksi.lehtonen',200108 UNION ALL
    SELECT 'Iida','Koskinen','iida.koskinen',200109 UNION ALL
    SELECT 'Miro','Jarvinen','miro.jarvinen',200110;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET cur_done = 1;

  START TRANSACTION;

  -- 1) Teacher
  SET v_teacher_userid = (
    SELECT userid FROM users
    WHERE LOWER(email) = LOWER(p_teacher_email)
    LIMIT 1
  );

  IF v_teacher_userid IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Teacher not found (email)';
  END IF;

  -- 2) Student group by name (G25443)
  SET v_studentgroupid = (
    SELECT studentgroupid FROM studentgroups
    WHERE group_name = p_group_name
    LIMIT 1
  );

  IF v_studentgroupid IS NULL THEN
    INSERT INTO studentgroups (group_name) VALUES (p_group_name);
    SET v_studentgroupid = LAST_INSERT_ID();
  END IF;

  -- 3) Ensure teacher has a course (courseinstructors)
  SET v_courseid = (
    SELECT c.courseid
    FROM courseinstructors ci
    JOIN courses c ON c.courseid = ci.courseid
    WHERE ci.userid = v_teacher_userid
    LIMIT 1
  );

  IF v_courseid IS NULL THEN
    -- Create course for teacher
    INSERT INTO courses (name, start_date, end_date, code, studentgroupid)
    VALUES (
      CONCAT('Teacher Course ', v_teacher_userid),
      DATE_SUB(CURDATE(), INTERVAL 30 DAY),
      DATE_ADD(CURDATE(), INTERVAL 60 DAY),
      CONCAT('T', v_teacher_userid, '_', DATE_FORMAT(NOW(), '%y%m%d%H%i'), '_', LPAD(FLOOR(RAND()*100),2,'0')),
      v_studentgroupid
    );
    SET v_courseid = LAST_INSERT_ID();

    INSERT INTO courseinstructors (courseid, userid)
    VALUES (v_courseid, v_teacher_userid);
  ELSE
    -- Make sure the existing course uses the desired studentgroup
    UPDATE courses
    SET studentgroupid = v_studentgroupid
    WHERE courseid = v_courseid;
  END IF;

  -- 4) Ensure topic for course
  SET v_topicid = (
    SELECT topicid FROM coursetopics
    WHERE courseid = v_courseid
    LIMIT 1
  );

  IF v_topicid IS NULL THEN
    INSERT INTO topics (topicname) VALUES ('General');
    SET v_topicid = LAST_INSERT_ID();
    INSERT INTO coursetopics (courseid, topicid) VALUES (v_courseid, v_topicid);
  END IF;

  -- 5) Ensure base student exists: student@metropolia.fi (Sam Student)
  SET v_base_student_userid = (
    SELECT userid FROM users
    WHERE LOWER(email) = 'student@metropolia.fi'
    LIMIT 1
  );

  IF v_base_student_userid IS NULL THEN
    INSERT INTO users (
      username, email, staff, first_name, last_name,
      created_at, studentnumber, studentgroupid,
      roleid, GDPR, darkMode, language, activeStatus
    )
    VALUES (
      'student',
      'student@metropolia.fi',
      0,
      'Sam',
      'Student',
      NOW(),
      10001,
      v_studentgroupid,
      1,   -- student
      1,
      1,
      'en',
      1
    );
    SET v_base_student_userid = LAST_INSERT_ID();
  ELSE
    -- Keep it aligned with the group and active status (optional but useful)
    UPDATE users
    SET studentgroupid = v_studentgroupid,
        roleid = 1,
        staff = 0,
        GDPR = 1,
        darkMode = 1,
        language = 'en',
        activeStatus = 1
    WHERE userid = v_base_student_userid;
  END IF;

  -- Attach base student to course
  SET v_usercourseid = (
    SELECT usercourseid FROM usercourses
    WHERE userid = v_base_student_userid AND courseid = v_courseid
    LIMIT 1
  );

  IF v_usercourseid IS NULL THEN
    INSERT INTO usercourses (userid, courseid)
    VALUES (v_base_student_userid, v_courseid);
  END IF;

  -- 6) 10 named students + attach to course
  SET cur_done = 0;
  OPEN cur_students;

  read_loop: LOOP
    FETCH cur_students INTO v_fn, v_ln, v_email_local, v_sn;
    IF cur_done = 1 THEN
      LEAVE read_loop;
    END IF;

    SET v_email = CONCAT(v_email_local, '@metropolia.fi');

    SET v_student_userid = (
      SELECT userid FROM users
      WHERE LOWER(email) = LOWER(v_email)
      LIMIT 1
    );

    IF v_student_userid IS NULL THEN
      -- username VARCHAR(20)
      SET v_uname_base = LOWER(CONCAT(LEFT(v_fn,1), v_ln));
      SET v_uname_base = REPLACE(v_uname_base, ' ', '');
      SET v_uname_base = LEFT(v_uname_base, 16);
      SET v_uname_try = LEFT(CONCAT(v_uname_base, LPAD(FLOOR(RAND()*100),2,'0')), 20);

      INSERT INTO users (
        username, email, staff, first_name, last_name,
        created_at, studentnumber, studentgroupid,
        roleid, GDPR, darkMode, language, activeStatus
      )
      VALUES (
        v_uname_try, v_email, 0, v_fn, v_ln,
        NOW(), v_sn, v_studentgroupid,
        1, 1, 0, 'fi', 1
      );

      SET v_student_userid = LAST_INSERT_ID();
    ELSE
      UPDATE users
      SET studentgroupid = v_studentgroupid
      WHERE userid = v_student_userid;
    END IF;

    SET v_usercourseid = (
      SELECT usercourseid FROM usercourses
      WHERE userid = v_student_userid AND courseid = v_courseid
      LIMIT 1
    );

    IF v_usercourseid IS NULL THEN
      INSERT INTO usercourses (userid, courseid)
      VALUES (v_student_userid, v_courseid);
    END IF;

  END LOOP;

  CLOSE cur_students;

  -- 7) Lectures + attendance (CLOSED)
  SET l = 1;
  WHILE l <= p_lectures_per_course DO
    SET v_lecture_start = DATE_SUB(CURDATE(), INTERVAL (21 - l*3) DAY);

    INSERT INTO lecture (start_date, end_date, teacherid, timeofday, topicid, courseid, state)
    VALUES (
      v_lecture_start, v_lecture_start, v_teacher_userid,
      IF(RAND() < 0.5, 'am', 'pm'),
      v_topicid, v_courseid, 'closed'
    );

    SET v_lectureid = LAST_INSERT_ID();

    INSERT INTO attendance (status, date, usercourseid, lectureid)
    SELECT
      CASE WHEN r < 0.70 THEN 1 WHEN r < 0.90 THEN 0 ELSE 2 END,
      v_lecture_start,
      uc.usercourseid,
      v_lectureid
    FROM (
      SELECT usercourseid, RAND() AS r
      FROM usercourses
      WHERE courseid = v_courseid
    ) uc;

    SET l = l + 1;
  END WHILE;

  -- Extra safety: close any past open lectures for this teacher
  UPDATE lecture
  SET state = 'closed'
  WHERE teacherid = v_teacher_userid
    AND state = 'open'
    AND start_date < CURDATE();

  COMMIT;
END $$

DELIMITER ;

-- RUN (20 lectures per student => set last param to 20)
CALL seed_teacher_students_g25443('teacher@metropolia.fi', 'G25443', 20);