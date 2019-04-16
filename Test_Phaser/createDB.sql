DROP DATABASE IF EXISTS FinalProject;
CREATE DATABASE FinalProject;
USE FinalProject;

CREATE TABLE Game(
        gameID INT(11) PRIMARY KEY auto_increment,
        realGameID INT(11) NOT NULL,
        count INT(11) NOT NULL
);

CREATE TABLE User (
	userID INT(11) PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL,
        win INT(11) NULL,
        lose INT(11) NULL,
        totalGame INT(11) NULL
);