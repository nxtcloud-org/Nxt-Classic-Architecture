import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Mail, Phone, Github, Linkedin, Moon, Sun, Award, ThumbsUp, Users, ChevronDown, ChevronUp } from 'lucide-react';


const experienceData = [
  { 
    year: 2022, 
    certifications: 1, 
    activities: 2,
    certDetail: "AWS 학생 교육 프로그램 수료",
    actDetail: "AWS 기초 강좌 수강 및 실습\n자료구조/알고리즘 과목 수강"
  },
  { 
    year: 2023, 
    certifications: 2, 
    activities: 3,
    certDetail: "AWS Cloud Practitioner\nAWS Solutions Architect Associate",
    actDetail: "EC2, S3를 활용한 웹 서비스 구축\nCloudWatch 모니터링 대시보드 구축\n서버리스 아키텍처 설계 및 구현"
  },
  { 
    year: 2024, 
    certifications: 3, 
    activities: 4,
    certDetail: "AWS Cloud Practitioner\nAWS Solutions Architect Associate\nAWS AI Practitioner",
    actDetail: "AWS 심화 강좌 수강 및 실습\nAWS 대학생 유저 그룹 운영진\n교내 DevOps 동아리\n웹서버 구축 프로젝트"
  },
  { 
    year: 2025, 
    certifications: 5, 
    activities: 5,
    certDetail: "AWS Professional 자격증 목표\n추가 클라우드 자격증 취득 예정",
    actDetail: "클라우드 네이티브 프로젝트 리드\n기술 컨퍼런스 발표 목표\n인턴십 목표"
  }
];

const projectExperience = [
 { name: '인프라/데브옵스', value: 40 },
 { name: '백엔드 개발', value: 30 },
 { name: '클라우드 아키텍처', value: 20 },
 { name: '모니터링/로깅', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const LAMBDA_URL = ''; // Lambda 함수의 URL

export default function InteractiveResume() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeChart, setActiveChart] = useState('experience');
  const [visitCount, setVisitCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState(new Set());  // Set으로 변경

  // toggleSection 함수 수정
  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newSections = new Set(prev);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  };
 useEffect(() => {
   // 방문 카운트 GET
   fetch(`${LAMBDA_URL}/visit`)
     .then(response => response.json())
     .then(data => {
      console.log(`!!!!!!!!!!!!!!! ${data}`)
      setVisitCount(data.visits)
    });

   // 좋아요 카운트 GET
   fetch(`${LAMBDA_URL}/likes`)
     .then(response => response.json())
     .then(data => 
      {
        console.log(`@@@@@@ ${data}`)
        setLikeCount(data.likes)
      });
 }, []);

 const handleLike = () => {
   fetch(`${LAMBDA_URL}/like`, { method: 'POST' })
     .then(response => response.json())
     .then(data => setLikeCount(data.likes));
 };

 const baseTextColor = darkMode ? 'text-white' : 'text-gray-800';
 const baseBgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
 const cardBgColor = darkMode ? 'bg-gray-800' : 'bg-white';

  const renderExperienceChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={experienceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="certifications" 
          name="자격증/교육이수" 
          stroke="#8884d8" 
        />
        <Line 
          type="monotone" 
          dataKey="activities" 
          name="주요 활동" 
          stroke="#82ca9d" 
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 bg-white shadow-lg rounded-lg border border-gray-200`}>
          <p className="font-bold text-lg mb-2">{label}년</p>
          <div className="mb-2">
            <p className="font-semibold text-purple-600">자격증/교육이수 ({payload[0].value}개)</p>
            <p className="text-sm whitespace-pre-line">{payload[0].payload.certDetail}</p>
          </div>
          <div>
            <p className="font-semibold text-green-600">주요 활동 ({payload[1].value}개)</p>
            <p className="text-sm whitespace-pre-line">{payload[1].payload.actDetail}</p>
          </div>
        </div>
      );
    }
    return null;
  };

 const renderprojectExperience = () => (
   <ResponsiveContainer width="100%" height={300}>
     <PieChart>
       <Pie
         data={projectExperience}
         innerRadius={60}
         outerRadius={80}
         paddingAngle={5}
         dataKey="value"
       >
         {projectExperience.map((entry, index) => (
           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
         ))}
       </Pie>
       <Tooltip />
       <Legend />
     </PieChart>
   </ResponsiveContainer>
 );

 return (
   <div className={`min-h-screen ${baseBgColor} ${baseTextColor} transition-colors duration-300`}>
     <div className="max-w-6xl mx-auto p-6">
       {/* Stats Bar */}
       <div className={`w-full ${cardBgColor} p-4 rounded-lg mb-8 flex justify-between items-center`}>
         <div className="flex items-center space-x-8">
           <div className="flex items-center">
             <Users className="w-5 h-5 mr-2" />
             <span>방문자 수: {visitCount}</span>
           </div>
           <div className="flex items-center">
             <ThumbsUp className="w-5 h-5 mr-2" />
             <span>좋아요: {likeCount}</span>
           </div>
         </div>
         <button
           onClick={handleLike}
           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
         >
           <ThumbsUp className="w-4 h-4 mr-2" />
           좋아요
         </button>
       </div>

       <header className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-4xl font-bold mb-2">홍길동</h1>
           <h2 className="text-2xl text-blue-500">클라우드 엔지니어링에 대한 열정을 가진 대학생</h2>
         </div>
         <button
           onClick={() => setDarkMode(!darkMode)}
           className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}`}
         >
           {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
         </button>
       </header>
      <section className="mb-8 flex flex-wrap gap-4 text-sm">
        <a 
          href="mailto:example@email.com" 
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" />
          example@email.com
        </a>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          010-1234-5678
        </div>
        <a 
          href="https://github.com/yourid" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          <Github className="w-4 h-4 mr-2" />
          github.com/yourid
        </a>
        <a 
          href="https://linkedin.com/in/yourprofile" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          linkedin.com/in/yourprofile
        </a>
      </section>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-lg ${cardBgColor}`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" /> Achievements
          </h3>
          <ul className="space-y-4">
          <li>
            <span className="font-medium">- 자격증 취득: AWS Certified Cloud Practitioner (CLF)</span>
            <ul className="mt-1 ml-4 text-sm">
              <li className="text-gray-600 dark:text-gray-400">AWS의 기초 지식과 클라우드 컴퓨팅의 개념을 이해하고 있으며, AWS 인프라에 대한 기초적인 사용 및 운영 능력을 인증받음</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">- 자격증 취득: AWS Certified Solutions Architect – Associate (SAA)</span>
            <ul className="mt-1 ml-4 text-sm">
              <li className="text-gray-600 dark:text-gray-400">AWS 아키텍처의 설계 및 배포에 필요한 고급 기술을 보유하고 있으며, 확장 가능하고 비용 효율적인 클라우드 솔루션을 설계할 수 있는 능력을 인증받음</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">- 해커톤 입상: DSC 공유대학 해커톤 최우수상</span>
            <ul className="mt-1 ml-4 text-sm">
              <li className="text-gray-600 dark:text-gray-400">모빌리티를 활용한 지역사회 문제해결을 주제로 한 해커톤에서 사회적 고립 청년들의 사회 복귀를 지원하는 챌린지 프로젝트를 설계하여, AWS 서비스 기반의 데이터 수집 및 분석을 통해 맞춤형 지원 방안을 제안</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">- AWS GameDay 행사 참여: Generative AI Unicorn Party GameDay</span>
            <ul className="mt-1 ml-4 text-sm">
              <li className="text-gray-600 dark:text-gray-400">참가자들이 AWS 솔루션을 사용하여 실제 기술 문제를 해결하는 데 도전하는 게임화된 학습 이벤트로 해당 Gameday에서는 생성형 AI와 관련된 문제 해결을 중심으로 진행</li>
            </ul>
          </li>
        </ul>
        </div>
        <div className={`p-6 rounded-lg ${cardBgColor}`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" /> Project Experience
          </h3>
            {renderprojectExperience()}
        </div>
      </div>
      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'GenAI with Cloud',
              description: 'PartyRock 위젯 활용 AI 실습',
              achievements: [
                'AWS AI 서비스 활용한 애플리케이션 개발 사례 학습',
                'AI 생성 콘텐츠의 투명성, 딥페이크 등 윤리적 문제와 사회적 영향 이해',
                '책임 있는 AI 개발을 위한 AWS의 기술 및 정책 소개: Amazon Bedrock Guardrails',
                'Amazon Titan Image Generator의 워터마크 기능 및 감지 API'
              ],
            },
            {
              title: '서비스 배포 with Cloud',
              description: '2-티어, 3-티어 아키텍처 구축 실습',
              achievements: [
                '랜덤 명언 앱, AI 학습 노트 앱 개발 및 배포',
                'RDS 연동, API 및 프론트엔드(React) 개발',
                '배포(S3, EC2), AI 기능(Bedrock) 연동까지 전 과정 실습 경험'
              ],
            },
            {
              title: 'Serverless & AI 실습',
              description: '서버리스 기반 챗봇 개발 실습',
              achievements: [
                'Rekognition 활용 얼굴인식 로그인 구현 실습',
                'S3 프론트엔드 배포 및 Lambda 함수와 boto3를 활용한 백엔드 배포',
                'CloudFront를 활용하여 HTTPS 엔드포인트 배포 및 S3 웹 사이트 통합',
              ],
            },
            {
              title: 'AWS 자격증반 수강',
              description: 'AWS CLF, SAA 자격증반 수강 및 대비',
              achievements: [
                'AWS의 핵심 서비스 이해와 클라우드 설계 원칙 학습',
                '실전 문제 풀이를 통한 시험 대비 역량 강화',
                '문제 풀이 사이트 및 학습 자료로 부족한 부분 보완'
              ],
            },
            {
              title: '서버리스 MSA',
              description: '서버리스 MSA 아키텍처 기반 3-티어 아키텍처 구축 실습',
              achievements: [
                '쇼핑몰 애플리케이션 개발 및 배포',
                'SQS를 통해 마이크로서비스 간의 비동기 메시징 처리 및 이벤트 기반 아키텍처 구현',
                'Streamlit을 활용해 간단한 프론트엔드를 구축하여 사용자 인터페이스 개발',
              ],
            },
            {
              title: 'Resume Challenge',
              description: 'AWS 핵심 서비스들을 활용한 이력서 웹사이트 배포 실습',
              achievements: [
                'HTML/CSS로 작성한 이력서를 S3 버킷에 배포하여 웹 호스팅',
                'DynamoDB 테이블과 Lambda 함수로 웹사이트 좋아요 기능 추가',
                '가상 서버 EC2 구동 및 환경 설정 경험'
              ],
            },
            {
              title: 'Face Authentication App',
              description: 'Amazon Rekognition으로 만드는 얼굴 인식 인증 시스템',
              achievements: [
                'CloudFront 배포를 통한 안전한 웹 애플리케이션 제공',
                'Rekognition API와 Lambda를 연결해 얼굴 비교 로직 작성',
                'S3 정적 웹 호스팅으로 얼굴 인증 프론트엔드 구현'
              ],
            }
          ].map((edu, index) => (
            <div key={index} className={`p-4 rounded-lg ${cardBgColor} shadow-lg transition-all duration-300`}>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(`edu-${index}`)}
              >
                <div>
                  <h4 className="text-xl font-semibold">{edu.title}</h4>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {edu.description}
                  </p>
                </div>
                {expandedSections.has(`edu-${index}`) ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </div>
              {expandedSections.has(`edu-${index}`) && (
                <ul className={`list-disc list-inside mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} className="mt-2">
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className={`p-6 rounded-lg ${cardBgColor} mb-8`}>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveChart('experience')}
            className={`px-4 py-2 rounded ${activeChart === 'experience' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Experience
          </button>
        </div>
        {activeChart === 'experience' && renderExperienceChart()}
      </div>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Projects</h3>
        <div className="space-y-4">
          {[
            {
              title: '학과 스터디 매칭 플랫폼 AWS 배포',
              achievements: [
                'AWS EC2에 Node.js 백엔드 서버 배포 및 RDS(MySQL) 연동',
                'Terraform IaC를 활용한 AWS 리소스 자동화',
                'DevOps/인프라 담당'
              ],
            },
            {
              title: '교내 동아리 웹사이트 클라우드 전환',
              achievements: [
                'AWS S3와 CloudFront를 활용한 정적 웹사이트 호스팅',
                'Route53을 통한 도메인 관리 및 HTTPS 설정',
                'Lambda를 활용한 이미지 리사이징 자동화 구현',
                'CloudWatch로 접속자 수 모니터링 대시보드 구축'
              ],
            },
            {
              title: '개인 블로그 운영',
              achievements: [
                '프로젝트 진행 과정 블로그 연재 중',
                'SAA 문제 풀이 블로그 연재 중'
              ],
            }
          ].map((project, index) => (
            <div key={index} className={`p-4 rounded-lg ${cardBgColor} shadow-lg transition-all duration-300`}>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(`project-${index}`)}
              >
                <h4 className="text-xl font-semibold">{project.title}</h4>
                {expandedSections.has(`project-${index}`) ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </div>
              {expandedSections.has(`project-${index}`) && (
                <ul className={`list-disc list-inside mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {project.achievements.map((achievement, i) => (
                    <li key={i} className="mt-2">
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { skill: 'AWS', color: 'bg-yellow-200 text-gray-800' },
            { skill: 'Python', color: 'bg-green-200 text-gray-800' },
            { skill: 'Terraform', color: 'bg-blue-200 text-gray-800' },
            { skill: 'Docker', color: 'bg-indigo-200 text-gray-800' },
            { skill: 'CI/CD', color: 'bg-red-200 text-gray-800' },
            { skill: 'React', color: 'bg-teal-200 text-gray-800' },
          ].map(({ skill, color }) => (
            <span
              key={skill}
              className={`px-3 py-1 rounded-full text-sm ${color} transition-colors duration-300 hover:bg-opacity-80 cursor-default`}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  </div>
  )
}
