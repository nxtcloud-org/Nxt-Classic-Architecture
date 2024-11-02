#!/bin/bash

# 프로젝트 디렉터리로 이동
cd /home/ubuntu/server-univ

# 프로젝트 의존성 설치
npm install

# 운영체제 패키지 업데이트
sudo apt-get update

# pm2 패키지를 전역적으로 설치
npm install pm2@latest -g
