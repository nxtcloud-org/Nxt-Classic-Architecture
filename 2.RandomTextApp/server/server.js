require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 상태를 저장할 변수
let dbConnection = null;

// 데이터베이스 연결 함수
const connectToDatabase = () => {
    try {
        // 필수 환경변수 확인
        const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missingEnvVars.length > 0) {
            console.error('\n=== 데이터베이스 설정 오류 ===');
            console.error('누락된 환경변수:', missingEnvVars.join(', '));
            console.error('=================\n');
            return null;
        }

        // 데이터베이스 연결 설정
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 연결 시도
        connection.connect(err => {
            if (err) {
                console.error('\n=== 데이터베이스 연결 오류 ===');
                console.error('연결 실패 원인:', err.code);
                switch (err.code) {
                    case 'ER_ACCESS_DENIED_ERROR':
                        console.error('사용자 이름 또는 비밀번호가 잘못되었습니다.');
                        console.error('현재 시도한 접속 정보:');
                        console.error('- User:', process.env.DB_USER);
                        console.error('- Host:', process.env.DB_HOST);
                        break;
                    case 'ECONNREFUSED':
                        console.error('데이터베이스 서버에 연결할 수 없습니다.');
                        console.error('데이터베이스 서버가 실행 중인지 확인하세요.');
                        console.error('시도한 연결 주소:', process.env.DB_HOST);
                        break;
                    case 'ER_BAD_DB_ERROR':
                        console.error('데이터베이스를 찾을 수 없습니다.');
                        console.error('시도한 데이터베이스 이름:', process.env.DB_NAME);
                        break;
                    default:
                        console.error('상세 에러 메시지:', err.message);
                }
                console.error('\n=== 환경변수 설정값 ===');
                console.error('DB_HOST:', process.env.DB_HOST);
                console.error('DB_USER:', process.env.DB_USER);
                console.error('DB_NAME:', process.env.DB_NAME);
                console.error('DB_PASSWORD:', '********');
                console.error('=================\n');
                dbConnection = null;
                return;
            }
            console.log('\n=== 데이터베이스 연결 성공 ===');
            console.log('Host:', process.env.DB_HOST);
            console.log('Database:', process.env.DB_NAME);
            console.log('User:', process.env.DB_USER);
            console.log('=================\n');
            dbConnection = connection;
        });

        return connection;
    } catch (error) {
        console.error('\n=== 데이터베이스 연결 중 예상치 못한 오류 ===');
        console.error('에러 타입:', error.name);
        console.error('에러 메시지:', error.message);
        console.error('=================\n');
        return null;
    }
};

// 데이터베이스 설정 상태를 확인하는 함수
const getDatabaseConfigStatus = () => {
    const configStatus = {
        DB_HOST: process.env.DB_HOST || '설정되지 않음',
        DB_USER: process.env.DB_USER || '설정되지 않음',
        DB_NAME: process.env.DB_NAME || '설정되지 않음',
        DB_PASSWORD: process.env.DB_PASSWORD || '설정되지 않음'  // 패스워드 노출
    };

    // 각 설정의 상태를 확인
    const isConfigComplete = Object.values(configStatus).every(value => value !== '설정되지 않음');
    
    return {
        configStatus,
        isConfigComplete
    };
};

// 서버 상태 정보를 콘솔에 출력하는 함수
const printServerStatus = () => {
    console.log('\n=== 서버 상태 ===');
    console.log(`포트: ${port}`);
    
    console.log('\n=== 데이터베이스 설정 정보 ===');
    const { configStatus, isConfigComplete } = getDatabaseConfigStatus();
    
    console.log('Host:', configStatus.DB_HOST);
    console.log('User:', configStatus.DB_USER);
    console.log('Database:', configStatus.DB_NAME);
    console.log('Password:', configStatus.DB_PASSWORD);  // 패스워드 노출
    
    console.log('\n=== 설정 상태 ===');
    console.log(`환경변수 설정: ${isConfigComplete ? '완료 ✅' : '미완료 ❌'}`);
    if (!isConfigComplete) {
        console.log('누락된 설정이 있습니다. .env 파일을 확인해주세요.');
    }
    console.log('=================\n');
};

// 데이터베이스 연결 시도
connectToDatabase();

// 기본 경로 - DB 연결 없이도 동작
app.get('/', (req, res) => {
    const { configStatus, isConfigComplete } = getDatabaseConfigStatus();
    
    res.json({ 
        message: '서버 실행 중..',
        serverStatus: {
            dbConnection: dbConnection ? '연결됨' : '연결되지 않음',
            configStatus: {
                host: configStatus.DB_HOST,        // 실제 값 노출
                user: configStatus.DB_USER,        // 실제 값 노출
                database: configStatus.DB_NAME,    // 실제 값 노출
                password: configStatus.DB_PASSWORD // 실제 값 노출
            },
            isConfigComplete
        }
    });
});

// DB 연결 상태 체크 미들웨어
const checkDbConnection = (req, res, next) => {
    if (!dbConnection) {
        return res.status(503).json({ 
            error: '데이터베이스 연결 실패',
            message: '현재 데이터베이스 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
            config: getDatabaseConfigStatus().configStatus  // 설정 상태도 함께 반환
        });
    }
    next();
};

// 랜덤 텍스트 조회 API - DB 연결 필요
app.get('/api/text', checkDbConnection, async (req, res) => {
    console.log(`데이터베이스 연결 상태: ${dbConnection ? '연결됨 ✅' : '연결되지 않음 ❌'}`);
    try {
        dbConnection.query('SELECT * FROM texts ORDER BY RAND() LIMIT 1', (error, results) => {
            if (error) {
                console.error('데이터 조회 중 오류:', error);
                return res.status(500).json({ error: '데이터 조회 실패' });
            }
            
            if (!results.length) {
                return res.status(404).json({ message: '저장된 텍스트가 없습니다' });
            }

            res.json({ text: `${results[0].text} by ${results[0].username}` });
        });
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 새로운 텍스트 저장 API - DB 연결 필요
app.post('/api/text', checkDbConnection, async (req, res) => {
    try {
        const { text, username } = req.body;

        if (!text || !username) {
            return res.status(400).json({ error: '텍스트와 사용자 이름은 필수입니다' });
        }

        const finalText = `${text} ...아마도...`;

        dbConnection.query('INSERT INTO texts SET ?', { text: finalText, username }, (error) => {
            if (error) {
                console.error('데이터 저장 중 오류:', error);
                return res.status(500).json({ error: '데이터 저장 실패' });
            }
            res.status(201).json({ message: '텍스트가 성공적으로 저장되었습니다' });
        });
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('예상치 못한 에러:', err);
    res.status(500).json({ error: '서버에서 오류가 발생했습니다' });
});

// 서버 시작
app.listen(port, () => {
    printServerStatus();
    console.log(`서버가 ${port}번 포트에서 실행 중입니다`);
});

// 예상치 못한 에러 처리
process.on('uncaughtException', (error) => {
    console.error('처리되지 않은 에러:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('처리되지 않은 Promise 거부:', error);
    process.exit(1);
});
