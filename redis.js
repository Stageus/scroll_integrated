
const redis = require("redis").createClient();

const VIEWCOUNT = "viewcount";
const STAR = "star";
const VOTERLIST = "voteId";

// 특정 웹툰의 조회수 1 증가
const addViewCount = async (webtoonId) => {

    let viewCount = null;
    let result = false;

    try {
        await redis.connect();

        if (await redis.exists(VIEWCOUNT)) {
            viewCount = await redis.zmScore(VIEWCOUNT, webtoonId);
            if (viewCount) {
                await redis.zIncrby(VIEWCOUNT, 1, webtoonId);
                result = true;
            }
        }

        if (!viewCount) {
            if (await redis.zAdd(VIEWCOUNT, 1, webtoonId)) {
                console.log("new viewCount add in", VIEWCOUNT);
                result = true;
            }
            else {
                console.log("failed to add new viewCount in", VIEWCOUNT);
                result = false;
            }
        }

        await redis.disconnect();
    }
    catch(err) {
        console.log("error in function addViewCount :", err);
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 조회수 불러오기
const getViewCount = async (webtoonId) => {

    let viewCount = -1;

    try {
        await redis.connect();
        
        if (await redis.exists(VIEWCOUNT)) {
            viewCount = await redis.zmScore(VIEWCOUNT, webtoonId);

            if (!viewCount) {
                viewCount = -1;
            }
        }

        await redis.disconnect();
    }
    catch(err) {
        console.log("error in function getViewCount :", err);
        await redis.disconnect();
    }

    return viewCount;
}

// 특정 웹툰에 별점 준 사람 기록
const saveVoters = async (webtoonId, voter) => {

    let result = null;
    const key = webtoonId + VOTERLIST;

    try {
        await redis.connect();

        result = await redis.sAdd(key, voter);

        await redis.disconnect();
    }
    catch(err) {
        result = 0;
        console.log("error in function saveVoters");
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 총 별점에 받은 별점 추가. 같은 사람이 전에 점수를 줬는지는 함수 호출 전에 확인
const addStar = async (webtoonId, point) => {

    const key = webtoonId + STAR;
    let result = null;
    let starPoint = 0;

    try {
        await redis.connect();

        if (await redis.exists(key)) {
            starPoint = await redis.get(key);
        }

        starPoint += point;
        await redis.set(key, starPoint);

        await redis.disconnect();
        result = true;
    }
    catch(err) {
        result = false;
        console.log("error in function addStar :", err);
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 평균 별점(star/voterCount) 불러오기
const getAvgStar = async (webtoonId) => {
    const starKey = webtoonId + STAR;
    const voterKey = webtoonId + VOTERLIST;
    let starPoint = 0;
    let voterCount = 0;
    let starAvg = 0;

    try {
        await redis.connect();

        if (await redis.exists(starKey)) {
            starPoint = await redis.get(starKey);
            const voters = await redis.sMembers(voterKey);
            voterCount = voters.length; // 투표자의 수 저장. voters 반환 타입 확인하기
        }

        await redis.disconnect();
    }
    catch(err) {
        console.log("error in function getAvgStar :", err);
        await redis.disconnect();
    }

    if (voterCount > 0) {
        starAvg = (starPoint/voterCount).toFixed(1);
    }
    else {
        starAvg = -1;
    }

    return starAvg;
}

module.exports = a;