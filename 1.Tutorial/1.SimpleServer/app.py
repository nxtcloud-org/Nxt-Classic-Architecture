import streamlit as st

# 앱 제목
st.title("🎉 대학생 자기 소개 앱 🎓")

# 부제목
st.subheader("Streamlit으로 나만의 멋진 앱 만들기 🚀")

# 입력 폼과 결과를 두 개의 컬럼으로 구성
col1, col2 = st.columns(2)

with col1:
    st.write("👋 **자기 소개를 입력해 주세요!**")
    name = st.text_input("📝 이름", "홍길동")  # 디폴트값 추가
    major = st.text_input("📚 전공", "컴퓨터공학과")  # 디폴트값 추가
    hobby = st.text_input("🎨 취미", "영화 보기")  # 디폴트값 추가
    introduction = st.text_area(
        "🖊️ 자기소개",
        "안녕하세요! 저는 홍길동입니다. 새로운 기술을 배우고 적용하는 것을 좋아합니다.",
    )  # 디폴트값 추가

with col2:
    st.write("### 🎯 자기소개 내용")
    if st.button("✨ 제출하기"):
        # 입력 결과를 화면에 출력
        if name and major and hobby and introduction:
            st.success("✅ 자기 소개가 성공적으로 제출되었습니다!")
            st.write(f"- **🧑‍💻 이름**: {name}")
            st.write(f"- **📖 전공**: {major}")
            st.write(f"- **🎉 취미**: {hobby}")
            st.write(f"- **✍️ 자기소개**: {introduction}")
            st.balloons()  # 풍선 애니메이션 출력
        else:
            st.error("❌ 모든 필드를 입력해 주세요!")

# 추가 정보 (하단 박스에 배치)
st.write("---")
st.info(
    """
    💡 **이 앱은 Streamlit으로 제작되었습니다!**  
    👉 간단한 Python 코드로 멋진 웹 앱을 만들어 보세요. 🎨  
    🚀 **AWS Bedrock을 이용해서 AI가 자동으로 이력서를 만들어주는 웹페이지를 만들어보세요!** 📝🤖
    """
)
