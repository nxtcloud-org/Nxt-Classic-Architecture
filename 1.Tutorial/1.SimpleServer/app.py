import streamlit as st

# 앱 제목
st.title("대학생 자기 소개 앱")

# 부제목
st.subheader("Streamlit을 사용하여 간단한 앱을 만들어 보세요!")

# 입력 필드
st.write("아래에 자기 소개를 입력해 주세요.")
name = st.text_input("이름", placeholder="예: 홍길동")
major = st.text_input("전공", placeholder="예: 컴퓨터공학과")
hobby = st.text_input("취미", placeholder="예: 영화 보기")
introduction = st.text_area("자기소개", placeholder="자기 소개를 간단히 입력해 주세요.")

# 버튼
if st.button("제출"):
    # 입력 결과를 화면에 출력
    if name and major and hobby and introduction:
        st.success("자기 소개가 성공적으로 제출되었습니다!")
        st.write("### 자기소개 내용")
        st.write(f"- **이름**: {name}")
        st.write(f"- **전공**: {major}")
        st.write(f"- **취미**: {hobby}")
        st.write(f"- **자기소개**: {introduction}")
    else:
        st.error("모든 필드를 입력해 주세요.")

# 추가 정보
st.write("---")
st.write("이후 LLM을 이용해서 이력서를 생성하도록 만들어보세요!")
