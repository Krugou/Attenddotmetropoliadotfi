USE jaksec;

ALTER TABLE users
  MODIFY username VARCHAR(20)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
  ALTER TABLE users
  MODIFY email VARCHAR(100)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
  ALTER TABLE users
  MODIFY first_name VARCHAR(100)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
  ALTER TABLE users
  MODIFY last_name VARCHAR(100)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;