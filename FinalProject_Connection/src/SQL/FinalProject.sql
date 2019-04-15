DROP DATABASE IF EXISTS FinalProject;
CREATE DATABASE FinalProject;
USE FinalProject;

CREATE TABLE Game(
	gameID INT(11) PRIMARY KEY auto_increment,
    realGameID INT(11) NOT NULL,
    count INT(11) NOT NULL
);

    