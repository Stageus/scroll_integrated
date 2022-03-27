
const pgConfig = {
    user: "ubuntu", // db 계정
    host: "postgres", // service 이름이 host가 됨
    // host: "localhost", // 테스트할 때만 사용
    database: "webtoon", // db 이름
    password: "11111", // db 패스워스
    port: 5432
}

module.exports = pgConfig;
