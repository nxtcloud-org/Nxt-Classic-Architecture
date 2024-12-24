require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
const port = 80;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터베이스 연결 상태를 저장할 변수
let dbConnection = null;

// OpenAI 설정
const configureOpenAI = () => {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error("OpenAI API 키가 설정되지 않았습니다.");
    return null;
  }
  return new OpenAI({ apiKey: openaiKey });
};

// 데이터베이스 연결 함수
const connectToDatabase = () => {
  try {
    const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      console.error("데이터베이스 설정이 없습니다:", missingEnvVars.join(", "));
      return null;
    }

    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    return new Promise((resolve, reject) => {
      connection.connect(async (err) => {
        if (err) {
          console.error("데이터베이스 연결 실패:", err);
          reject(err);
          return;
        }

        console.log("데이터베이스 연결 성공");

        // notes 테이블 생성
        try {
          await createNotesTable(connection);
          dbConnection = connection;
          resolve(connection);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("데이터베이스 연결 중 오류:", error);
    return Promise.reject(error);
  }
};

// notes 테이블 생성 함수
const createNotesTable = (connection) => {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_note TEXT,
                ai_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

    connection.query(createTableQuery, (err, result) => {
      if (err) {
        console.error("테이블 생성 중 오류:", err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// DB 연결 상태 체크 미들웨어
const checkDbConnection = (req, res, next) => {
  if (!dbConnection) {
    return res.status(503).json({
      error: "데이터베이스 연결 실패",
      message:
        "현재 데이터베이스 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.",
    });
  }
  next();
};

// OpenAI 설정 체크 미들웨어
const checkOpenAIConfig = (req, res, next) => {
  if (!openai) {
    return res.status(503).json({
      error: "OpenAI API 설정 실패",
      message:
        "AI 서비스를 현재 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
    });
  }
  next();
};

// OpenAI 초기화
const openai = configureOpenAI();

// 기본 경로
app.get("/", (req, res) => {
  res.json({
    message: "서버 실행 중",
    status: {
      database: dbConnection ? "연결됨" : "연결 안됨",
      openai: openai ? "설정됨" : "설정 안됨",
    },
  });
});

// 메모 추가 및 ChatGPT 분석
app.post("/notes", checkDbConnection, checkOpenAIConfig, async (req, res) => {
  const userMessage = req.body.content;

  if (!userMessage?.trim()) {
    return res.status(400).json({ error: "내용을 입력해주세요" });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert in AWS. Based on the data provided by the user, suggest one AWS service that the user can additionally learn. Ensure the response is at least three sentences long and in Korean.",
        },
        { role: "user", content: userMessage },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 1000,
    });

    const aiNote = completion.choices[0].message.content;
    const note = { user_note: userMessage, ai_note: aiNote };

    const sql = "INSERT INTO notes SET ?";
    dbConnection.query(sql, note, (err, result) => {
      if (err) {
        console.error("데이터베이스 저장 중 오류:", err);
        return res.status(500).json({ error: "데이터베이스 저장 실패" });
      }
      res.status(201).json({
        message: "기록이 저장되었습니다",
        id: result.insertId,
      });
    });
  } catch (error) {
    console.error("AI API 호출 중 오류:", error);
    res.status(500).json({ error: "AI 서비스 응답 실패" });
  }
});

// 전체 메모 불러오기
app.get("/notes", checkDbConnection, async (req, res) => {
  const sql = "SELECT * FROM notes ORDER BY created_at DESC";
  dbConnection.query(sql, (err, result) => {
    if (err) {
      console.error("데이터 조회 중 오류:", err);
      return res.status(500).json({ error: "데이터 조회 실패" });
    }
    res.json(result);
  });
});

// 특정 메모 삭제
app.delete("/notes/:id", checkDbConnection, async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM notes WHERE id = ?";
  dbConnection.query(sql, id, (err, result) => {
    if (err) {
      console.error("데이터 삭제 중 오류:", err);
      return res.status(500).json({ error: "데이터 삭제 실패" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "해당 ID의 메모를 찾을 수 없습니다" });
    }

    res.json({ message: "메모가 삭제되었습니다" });
  });
});

// 전체 메모 삭제
app.delete("/notes", checkDbConnection, async (req, res) => {
  const sql = "DELETE FROM notes";
  dbConnection.query(sql, (err, result) => {
    if (err) {
      console.error("전체 데이터 삭제 중 오류:", err);
      return res.status(500).json({ error: "전체 데이터 삭제 실패" });
    }
    res.json({
      message: "모든 메모가 삭제되었습니다",
      deletedCount: result.affectedRows,
    });
  });
});

// 서버 시작
const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      console.log("\n=== 서버 상태 ===");
      console.log(`포트: ${port}`);
      console.log(`데이터베이스 연결: ${dbConnection ? "성공 ✅" : "실패 ❌"}`);
      console.log(`OpenAI 설정: ${openai ? "성공 ✅" : "실패 ❌"}`);
      console.log("=================\n");
    });
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
};

// 예상치 못한 에러 처리
process.on("uncaughtException", (error) => {
  console.error("처리되지 않은 에러:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("처리되지 않은 Promise 거부:", error);
  process.exit(1);
});

startServer();
