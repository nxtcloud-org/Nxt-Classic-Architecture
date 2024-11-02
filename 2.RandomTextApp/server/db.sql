-- EC2에서 RDS 접속해서 초기 텍스트 입력
-- mysql -h DB엔드포인트 -u admin -p 
create database texts;
use texts;
CREATE TABLE texts (id INT AUTO_INCREMENT PRIMARY KEY, text TEXT NOT NULL, username VARCHAR(255) NOT NULL);
INSERT INTO texts (text, username) VALUES('언제나 현재에 집중할수 있다면 행복할것이다...아마도...', '파울로 코엘료');
INSERT INTO texts (text, username) VALUES('어리석은 자는 멀리서 행복을 찾고, 현명한 자는 자신의 발치에서 행복을 키워간다...아마도...', '제임스 오펜하임');
INSERT INTO texts (text, username) VALUES('성공의 비결은 단 한 가지, 잘할 수 있는 일에 광적으로 집중하는 것이다...아마도...', '톰 모나건');
