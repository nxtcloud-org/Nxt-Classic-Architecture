#!/bin/bash

# 변수 설정
BUCKET_NAME="AAA-000-s3"
REGION="us-east-1"

# 대상 파일 이름
INDEX_FILE="index.html"

# S3 버킷 생성
echo "S3 bucket 생성 중...\n\n"
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION

#us-east-1 외에는 --create-bucket-configuration 사용
# aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION --create-bucket-configuration LocationConstraint=$REGION

# 정적 웹사이트 호스팅 활성화
echo "정적 웹사이트 호스팅 활성화 중...\n\n"
aws s3 website s3://$BUCKET_NAME/ --index-document $INDEX_FILE

# 퍼블릭 액세스 차단 해제
echo "퍼블릭 액세스 차단 해제 중...\n\n"
aws s3api delete-public-access-block --bucket $BUCKET_NAME

# 버킷 정책 설정
echo "버킷 정책 설정 중...\n\n"
echo '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
        }
    ]
}' > bucket-policy.json
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# index.html 파일 업로드
echo "index.html 파일 업로드 중...\n\n"
aws s3 cp $INDEX_FILE s3://$BUCKET_NAME/

# 웹사이트 URL 출력
echo "배포된 웹사이트 주소 :"
echo "http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"

# 삭제 명령어
# echo "To delete the bucket and all its contents, run the following commands:"
# echo "aws s3 rm s3://$BUCKET_NAME --recursive"
# echo "aws s3api delete-bucket --bucket $BUCKET_NAME --region $REGION"
