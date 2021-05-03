DELIMITER $$
CREATE DEFINER=`root`@`%` PROCEDURE `create_user`(email VARCHAR(45))
BEGIN
    IF EXISTS (SELECT * FROM `user` AS u WHERE u.email = email)
    THEN SELECT 0 AS 'created', id FROM `user` AS u WHERE u.email = email;
    ELSE 
        INSERT INTO `user` (email) VALUES (email);
        SELECT 1 AS 'created', id FROM `user` AS u WHERE u.email = email;
    END IF;
END$$
DELIMITER ;
