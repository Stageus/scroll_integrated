
// redis의 데이터를 DB에 주기적으로 저장하는 내용

const pg = require("./pgRequest").Client;

const VIEWCOUNT = "viewcount";
const STAR = "star";
const VOTERLIST = "voteId";

// DB에 모든 데이터 업로드
const upload = async () => {

}

// DB에 모든 웹툰의 조회수 저장
const sendViewCountToDB = async () => {

    let toonAndView = null; // redis의 데이터를 담을 변수. 이 변수의 데이터를 DB로 보낸다.

    try {
        await redis.connect();

        // zRange 함수가 어떻게 값을 반환하는지 확인하기
        toonAndView = await redis.zRange(VIEWCOUNT, 0, -1);
        console.log(toonAndView);

        await redis.disconnect();
    }
    catch(err) {
        console.log("error in function sendViewCountToDB");
        await redis.disconnect();
    }

    // DB에 데이터 전송
}

// 별점 준 사람 리스트 DB에 모두 저장
const sendVotersToDB = async () => {

}

// 모든 웹툰의 별점 정보 DB에 저장
const sendStarToDB = async () => {

}

upload();