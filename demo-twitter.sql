CREATE DATABASE my_db;

\c my_db;

-- Table: users
CREATE TABLE users (
    id_user serial  NOT NULL,
    username varchar(150),
    CONSTRAINT users_pk PRIMARY KEY (id_user)
);
-- Table: tweets
CREATE TABLE tweets (
    id_tweet serial  NOT NULL,
    texto varchar(240),
    id_user_fk int,
    CONSTRAINT tweets_pk PRIMARY KEY (id_tweet)
);

-- Table: follows
CREATE TABLE follows (
    id_follower int  NOT NULL,
    id_followeed int  NOT NULL,
    CONSTRAINT follows_pk PRIMARY KEY (id_follower,id_followeed)
);

-- foreign keys
-- Reference: follows_users_1 (table: follows)
ALTER TABLE follows ADD CONSTRAINT follows_users_1
    FOREIGN KEY (id_follower)
    REFERENCES users (id_user)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: follows_users_2 (table: follows)
ALTER TABLE follows ADD CONSTRAINT follows_users_2
    FOREIGN KEY (id_followeed)
    REFERENCES users (id_user)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tweets_users (table: tweets)
ALTER TABLE tweets ADD CONSTRAINT tweets_users
    FOREIGN KEY (id_user_fk)
    REFERENCES users (id_user)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

INSERT INTO users(username) VALUES ('usuario1');
INSERT INTO users(username) VALUES ('usuario2');
INSERT INTO users(username) VALUES ('usuario3');
INSERT INTO users(username) VALUES ('usuario4');
INSERT INTO users(username) VALUES ('usuario5');
INSERT INTO users(username) VALUES ('usuario6');

INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet1',1);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet2',1);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet3',1);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet4',2);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet5',2);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet6',2);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet7',3);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet8',3);
INSERT INTO tweets(texto, id_user_fk) VALUES ('tweet9',3);

INSERT INTO follows(id_follower, id_followeed) VALUES (2,1);
INSERT INTO follows(id_follower, id_followeed) VALUES (3,1);
INSERT INTO follows(id_follower, id_followeed) VALUES (3,2);
INSERT INTO follows(id_follower, id_followeed) VALUES (4,3);
