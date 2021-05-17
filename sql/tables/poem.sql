CREATE TABLE `poem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `creation_timestamp` datetime NOT NULL,
  `modified_timestamp` datetime DEFAULT NULL,
  `privacy_level` enum('public','private') NOT NULL DEFAULT 'public',
  `archived` bit(1) NOT NULL DEFAULT b'0',
  `form` enum('haiku','sonnet','tonka') DEFAULT NULL,
  `generated` bit(1) NOT NULL DEFAULT b'0',
  `name` varchar(45) NOT NULL,
  `text` varchar(8000) NOT NULL,
  `num_likes` int NOT NULL DEFAULT '0',
  `num_dislikes` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `user_fk_idx` (`user_id`),
  CONSTRAINT `user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
