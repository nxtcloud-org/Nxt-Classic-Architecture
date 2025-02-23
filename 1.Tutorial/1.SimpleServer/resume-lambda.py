import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        logger.info("Lambda function started")
        logger.info(f"Received event: {json.dumps(event)}")
        
        try:
            body = json.loads(event['body'])
            logger.info(f"Parsed body: {body}")
        except Exception as e:
            logger.error(f"Error parsing request body: {str(e)}")
            raise
            
        name = body['name']
        major = body['major']
        hobby = body['hobby']
        introduction = body['introduction']
        
        logger.info("Creating Bedrock client")
        try:
            bedrock = boto3.client('bedrock-runtime')
            logger.info("Bedrock client created successfully")
        except Exception as e:
            logger.error(f"Error creating Bedrock client: {str(e)}")
            raise
        
        prompt = f"""주어진 정보를 바탕으로 300자 내외의 자기소개서를 작성해주세요.

정보:
- 이름: {name}
- 전공: {major}
- 취미: {hobby}
- 자기소개: {introduction}

자기소개서는 다음 항목을 포함해야 합니다:
1. 성장 배경과 학업 과정
2. 전공 선택 이유와 학업 계획
3. 취미와 특기를 통한 자기계발
4. 미래 목표와 비전"""

        logger.info("Sending request to Bedrock")
        try:
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
            logger.info(f"Request body to Bedrock: {json.dumps(request_body)}")
            
            response = bedrock.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0',
                contentType='application/json',
                accept='application/json',
                body=json.dumps(request_body)
            )
            logger.info("Received response from Bedrock")
            
        except Exception as e:
            logger.error(f"Error invoking Bedrock model: {str(e)}")
            raise
        
        try:
            response_body = json.loads(response['body'].read())
            logger.info(f"Parsed response body: {response_body}")
            # 수정된 부분: content 배열의 첫 번째 항목의 text를 가져옴
            generated_text = response_body['content'][0]['text']
        except Exception as e:
            logger.error(f"Error parsing Bedrock response: {str(e)}")
            raise
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'generated_text': generated_text
            })
        }
        
    except Exception as e:
        logger.error(f"Unhandled error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': str(e),
                'error_type': type(e).__name__
            })
        }
