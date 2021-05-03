CREATE DEFINER=`root`@`%` PROCEDURE `create_user`(email VARCHAR(45))
BEGIN
	DECLARE created bool DEFAULT 0;

    IF NOT EXISTS (SELECT * FROM `user` AS u WHERE u.email = email)
    THEN
		SET created = 1;
		INSERT INTO `user` (email) VALUES (email);        
    END IF;
    
    SELECT created AS 'created', id, email FROM `user` AS u WHERE u.email = email;
END
