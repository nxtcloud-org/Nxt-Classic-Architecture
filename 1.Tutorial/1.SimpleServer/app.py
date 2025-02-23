import streamlit as st
import requests
import json

# Lambda 함수 URL
LAMBDA_URL = "FILL_ME_IN : Lambda URL"
# https://2dnfoeg526p3bjg56iafrvubmi0pomln.lambda-url.us-east-1.on.aws/

# 앱 제목
st.title("🎉 대학생 자기 소개 앱 🚀")
# 부제목
st.subheader("AI가 작성해주는 멋진 자기소개서 ✨")

# 입력 폼과 결과를 두 개의 컬럼으로 구성
col1, col2 = st.columns(2)

with col1:
    st.write("👋 **자기 소개를 입력해 주세요!**")
    name = st.text_input("📝 이름", "홍길동")
    major = st.text_input("📚 전공", "컴퓨터공학과")
    hobby = st.text_input("🎨 취미", "영화 보기")
    introduction = st.text_area(
        "🖊️ 자기소개",
        "안녕하세요! 저는 홍길동입니다. 새로운 기술을 배우고 적용하는 것을 좋아합니다.",
    )

with col2:
    st.write("### 🎯 AI가 작성한 자기소개서")
    if st.button("✨ 자기소개서 생성하기"):
        if name and major and hobby and introduction:
            try:
                # Lambda 함수에 데이터 전송
                response = requests.post(
                    LAMBDA_URL,
                    json={
                        "name": name,
                        "major": major,
                        "hobby": hobby,
                        "introduction": introduction
                    },
                    timeout=25  # 25초 타임아웃 설정
                )
                
                if response.status_code == 200:
                    generated_text = response.json()['generated_text']
                    st.success("✅ AI가 자기소개서를 생성했습니다!")
                    st.write(generated_text)
                    st.balloons()
                else:
                    st.error("❌ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                    st.write("현재 입력된 정보:")
                    st.write(f"- **🧑‍💻 이름**: {name}")
                    st.write(f"- **📖 전공**: {major}")
                    st.write(f"- **🎉 취미**: {hobby}")
                    st.write(f"- **✍️ 자기소개**: {introduction}")
            
            except requests.exceptions.Timeout:
                st.error("⏰ 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")
                st.write("현재 입력된 정보:")
                st.write(f"- **🧑‍💻 이름**: {name}")
                st.write(f"- **📖 전공**: {major}")
                st.write(f"- **🎉 취미**: {hobby}")
                st.write(f"- **✍️ 자기소개**: {introduction}")
            
            except Exception as e:
                st.error(f"❌ AI 기능에 정상적으로 연결되지 않았습니다. {str(e)}")
                st.write("현재 입력된 정보:")
                st.write(f"- **🧑‍💻 이름**: {name}")
                st.write(f"- **📖 전공**: {major}")
                st.write(f"- **🎉 취미**: {hobby}")
                st.write(f"- **✍️ 자기소개**: {introduction}")
        else:
            st.error("❌ 모든 필드를 입력해 주세요!")

st.write("---")
# 추가 정보
st.info(
    """
    💡 **이 앱은 Streamlit과 AWS Bedrock을 활용한 AI 자기소개서 생성 앱입니다!** \n 
    👉 **Claude 3 Haiku 모델이 여러분의 정보를 바탕으로 맞춤형 자기소개서를 작성해드립니다.** \n
    🚀 **입력하신 정보를 바탕으로 AI가 전문적인 자기소개서를 작성해드립니다!** 📝🤖
    """
)
