#!/bin/bash

# 프로젝트 디렉터리로 이동
cd /home/ubuntu/server-univ

# pm2를 사용하여 server.js 프로세스를 중지. 오류가 발생하면 무시
pm2 stop server.js 2> /dev/null || true

# pm2에서 server.js 프로세스를 삭제. 오류가 발생하면 무시
pm2 delete server.js 2> /dev/null || true
