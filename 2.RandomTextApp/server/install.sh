# 패키지 리스트 업데이트
sudo apt-get update

# nvm 설치 (Node Version Manager: 노드 버전 관리 도구)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # nvm 로드
nvm install --lts  # LTS 버전의 노드 설치

# npm 설치 (Node Package Manager: 노드 패키지 관리 도구)
sudo apt-get install npm -y

# pm2 설치 (노드 프로세스 관리 도구)
npm install pm2@latest -g

# MySQL 클라이언트 설치
sudo apt install mysql-client-core-8.0

# codedeploy-agent 설치 (AWS CodeDeploy 에이전트)
sudo su
sudo apt-get update
sudo apt-get install ruby-full -y

wget https://aws-codedeploy-ap-northeast-2.s3.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# deploy 찾지 못할 경우 재시작
sudo service codedeploy-agent restart
