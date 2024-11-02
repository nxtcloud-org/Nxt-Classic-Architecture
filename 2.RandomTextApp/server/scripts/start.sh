#!/bin/bash

# 프로젝트 디렉터리로 이동
cd /home/ubuntu/server-univ

# 서버 시작
pm2 start server.js
