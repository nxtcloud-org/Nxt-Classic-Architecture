import json
import boto3
import pymysql
import os


def lambda_handler(event, context):
    print("EC2 -> Lambda로 전달된 데이터", event["body"])

    # Bedrock 클라이언트 초기화 - 버지니아 북부 리전으로 설정
    bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")

    try:
        input_data = json.loads(event["body"])
    except json.JSONDecodeError as e:
        print("JSON 파싱 오류:", e)
        return {"statusCode": 400, "body": "Invalid JSON format"}

    if not input_data or "content" not in input_data or "noteId" not in input_data:
        print("Invalid request: No content or noteId provided")
        return {"statusCode": 400, "body": "No content or noteId provided"}

    user_message = input_data["content"]
    note_id = input_data["noteId"]
    print(
        "ai한테 보낼 유저 메시지 내용",
        input_data["content"],
        type(input_data["content"]),
    )

    try:
        # Bedrock API 호출을 위한 요청 본문 구성
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "You are an expert in AWS. Based on the following data, suggest one AWS service that the user can additionally learn. Ensure the response is at least three sentences long and in Korean.",
                        },
                        {"type": "text", "text": user_message},
                    ],
                }
            ],
        }

        # Bedrock 모델 호출
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json",
        )

        response_body = json.loads(response.get("body").read())
        ai_response = response_body.get("content")[0].get("text")

        print("ai 한테 받아왔어?", ai_response)

        # 데이터베이스 연결 설정
        db = pymysql.connect(
            host=os.environ["DB_HOST"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ["DB_NAME"],
            cursorclass=pymysql.cursors.DictCursor,
        )

        try:
            with db.cursor() as cursor:
                # AI 응답 저장 - id 기반으로 수정
                sql = "UPDATE notes SET ai_note = %s, ai_type = %s WHERE id = %s"
                cursor.execute(sql, (ai_response, "claude", note_id))
                db.commit()
        finally:
            db.close()

        return ai_response

    except Exception as e:
        print("Error:", str(e))
        raise Exception("Lambda function error")
