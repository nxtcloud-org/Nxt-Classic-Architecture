require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 80;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 상태를 저장할 변수
let dbConnection = null;

// 데이터베이스 연결 함수
const connectToDatabase = () => {
  try {
      // Lambda URL을 제외한 필수 DB 환경변수만 체크
      const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingEnvVars.length > 0) {
          console.error('필수 데이터베이스 환경변수가 없습니다:', missingEnvVars.join(', '));
          return null;
      }

        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        return new Promise((resolve, reject) => {
            connection.connect(async err => {
                if (err) {
                    console.error('데이터베이스 연결 실패:', err);
                    reject(err);
                    return;
                }

                console.log('데이터베이스 연결 성공');
                
                try {
                    // await createNotesTable(connection); 
                    dbConnection = connection;
                    resolve(connection);
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('데이터베이스 연결 중 오류:', error);
        return Promise.reject(error);
    }
};

// notes 테이블 생성 함수 
// const createNotesTable = (connection) => {
//     return new Promise((resolve, reject) => {
//         const createTableQuery = `
//             CREATE TABLE IF NOT EXISTS notes (
//                 id INT AUTO_INCREMENT PRIMARY KEY,
//                 user_note TEXT NOT NULL,
//                 ai_note TEXT,
//                 ai_type ENUM('gpt', 'claude') DEFAULT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//             )
//         `;
        
//         connection.query(createTableQuery, (err, result) => {
//             if (err) {
//                 console.error('테이블 생성 중 오류:', err);
//                 reject(err);
//                 return;
//             }
//             console.log('Notes 테이블 준비 완료');
//             resolve(result);
//         });
//     });
// };

// DB 연결 상태 체크 미들웨어
const checkDbConnection = (req, res, next) => {
    if (!dbConnection) {
        return res.status(503).json({ 
            error: '데이터베이스 연결 실패',
            message: '현재 데이터베이스 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.'
        });
    }
    next();
};

// GPT Lambda 호출 함수
const callGPTLambda = async (content, noteId) => {
  if (!process.env.GPT_LAMBDA_URL) {
      throw new Error('GPT Lambda URL이 설정되지 않았습니다');
  }

  try {
      const response = await axios.post(process.env.GPT_LAMBDA_URL, { 
          content,
          noteId 
      });
      return response.data;
  } catch (error) {
      console.error('GPT Lambda 호출 중 오류:', error);
      throw new Error('GPT 서비스 호출 실패');
  }
};

// Claude Lambda 호출 함수
const callClaudeLambda = async (content, noteId) => {
  if (!process.env.BEDROCK_LAMBDA_URL) {
      throw new Error('Bedrock Lambda URL이 설정되지 않았습니다');
  }

  try {
      const response = await axios.post(process.env.BEDROCK_LAMBDA_URL, { 
          content,
          noteId 
      });
      return response.data;
  } catch (error) {
      console.error('Claude Lambda 호출 중 오류:', error);
      throw new Error('Claude 서비스 호출 실패');
  }
};
// 기본 경로
app.get("/", (req, res) => {
    res.json({ 
        message: "서버 실행 중",
        status: {
            database: dbConnection ? "연결됨" : "연결 안됨",
            gpt_lambda_url: process.env.GPT_LAMBDA_URL ? "설정됨" : "설정 안됨",
            claude_lambda_url: process.env.BEDROCK_LAMBDA_URL ? "설정됨" : "설정 안됨"
        }
    });
});

// 메모 추가
app.post("/notes", checkDbConnection, async (req, res) => {
    const { content } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({ error: "내용을 입력해주세요" });
    }

    const sql = "INSERT INTO notes (user_note) VALUES (?)";
    
    dbConnection.query(sql, [content], (err, result) => {
        if (err) {
            console.error('메모 저장 중 오류:', err);
            return res.status(500).json({ error: "메모 저장 실패" });
        }
        
        res.status(201).json({ 
            message: "메모가 저장되었습니다",
            id: result.insertId
        });
    });
});

// 전체 메모 조회
app.get("/notes", checkDbConnection, async (req, res) => {
    const sql = "SELECT * FROM notes ORDER BY created_at DESC";
    
    dbConnection.query(sql, (err, results) => {
        if (err) {
            console.error('메모 조회 중 오류:', err);
            return res.status(500).json({ error: "메모 조회 실패" });
        }
        res.json(results);
    });
});

// 특정 메모 삭제
app.delete("/notes/:id", checkDbConnection, async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM notes WHERE id = ?";

    dbConnection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('메모 삭제 중 오류:', err);
            return res.status(500).json({ error: "메모 삭제 실패" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "해당 ID의 메모를 찾을 수 없습니다" });
        }

        res.json({ message: "메모가 삭제되었습니다" });
    });
});

// 전체 메모 삭제
app.delete("/notes", checkDbConnection, async (req, res) => {
    const sql = "DELETE FROM notes";

    dbConnection.query(sql, (err, result) => {
        if (err) {
            console.error('전체 메모 삭제 중 오류:', error);
            return res.status(500).json({ error: "전체 메모 삭제 실패" });
        }

        res.json({ 
            message: "모든 메모가 삭제되었습니다",
            deletedCount: result.affectedRows
        });
    });
});

// GPT 조언 요청 처리
app.post("/gpt-notes", checkDbConnection, async (req, res) => {
    const { content, noteId } = req.body;

    if (!content?.trim() || !noteId) {
        return res.status(400).json({ error: "내용과 노트 ID가 필요합니다" });
    }

    if (!process.env.GPT_LAMBDA_URL) {
        return res.status(503).json({ 
            error: "GPT 서비스 사용 불가",
            message: "현재 GPT 서비스를 사용할 수 없습니다. Lambda URL 설정을 확인해주세요."
        });
    }

    try {
        console.log('GPT Lambda 함수 호출 중...');
        const aiResponse = await callGPTLambda(content, noteId);
        console.log('GPT Lambda 함수 호출 완료');

        // DB에 AI 응답 저장
        const updateSql = "UPDATE notes SET ai_note = ?, ai_type = 'gpt' WHERE id = ?";
        dbConnection.query(updateSql, [aiResponse, noteId], (err, result) => {
            if (err) {
                console.error('AI 응답 저장 중 오류:', err);
                return res.status(500).json({ error: "AI 응답 저장 실패" });
            }
            
            res.json({ message: "GPT 분석 요청이 처리되었습니다" });
        });
    } catch (error) {
        console.error('GPT 조언 요청 처리 중 오류:', error);
        res.status(500).json({ 
            error: "GPT 서비스 처리 실패",
            message: "잠시 후 다시 시도해주세요"
        });
    }
});

// Claude 조언 요청 처리
app.post("/claude-notes", checkDbConnection, async (req, res) => {
    const { content, noteId } = req.body;

    if (!content?.trim() || !noteId) {
        return res.status(400).json({ error: "내용과 노트 ID가 필요합니다" });
    }

    if (!process.env.BEDROCK_LAMBDA_URL) {
        return res.status(503).json({ 
            error: "Claude 서비스 사용 불가",
            message: "현재 Claude 서비스를 사용할 수 없습니다. Lambda URL 설정을 확인해주세요."
        });
    }

    try {
        console.log('Claude Lambda 함수 호출 중...');
        const aiResponse = await callClaudeLambda(content, noteId);
        console.log('Claude Lambda 함수 호출 완료');

        // DB에 AI 응답 저장
        const updateSql = "UPDATE notes SET ai_note = ?, ai_type = 'claude' WHERE id = ?";
        dbConnection.query(updateSql, [aiResponse, noteId], (err, result) => {
            if (err) {
                console.error('AI 응답 저장 중 오류:', err);
                return res.status(500).json({ error: "AI 응답 저장 실패" });
            }
            
            res.json({ message: "Claude 분석 요청이 처리되었습니다" });
        });
    } catch (error) {
        console.error('Claude 조언 요청 처리 중 오류:', error);
        res.status(500).json({ 
            error: "Claude 서비스 처리 실패",
            message: "잠시 후 다시 시도해주세요"
        });
    }
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

// 서버 시작
const startServer = async () => {
    try {
        await connectToDatabase();
        
        app.listen(port, () => {
            console.log('\n=== 서버 상태 ===');
            console.log(`포트: ${port}`);
            console.log(`GPT Lambda URL: ${process.env.GPT_LAMBDA_URL ? '설정됨 ✅' : '설정 안됨 ⚠️'}`);
            console.log(`Claude Lambda URL: ${process.env.BEDROCK_LAMBDA_URL ? '설정됨 ✅' : '설정 안됨 ⚠️'}`);
            if (!process.env.GPT_LAMBDA_URL || !process.env.BEDROCK_LAMBDA_URL) {
                console.log('※ Lambda URL이 설정되지 않은 AI 기능은 사용할 수 없습니다.');
            }
            console.log('=================\n');
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
};

startServer();
