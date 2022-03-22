
const redis = require("redis").createClient();

const VIEWCOUNT = "viewcount";
const STAR = "star";
const VOTERLIST = "voteId";
const HISTORY = "history";

// 특정 웹툰의 조회수 1 증가
const addViewCount = async (webtoonId) => {

    let result = {
        success: false,
        viewCount: null
    }

    try {
        await redis.connect();

        const zScoreResult = await redis.zScore(VIEWCOUNT, webtoonId);
        console.log("zScoreResult :", zScoreResult);

        if (zScoreResult != null) {
            result.viewCount = await redis.zIncrBy(VIEWCOUNT, 1, webtoonId);
            console.log("viewCount :", result.viewCount);
        }
        else {
            const zAddResult = await redis.zAdd(VIEWCOUNT, {score: 1, value: webtoonId});
            console.log("new viewCount add in", VIEWCOUNT);
            console.log("redisSuccess:", zAddResult);
            result.viewCount = 1;
        }

        await redis.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("error in function addViewCount :", err);
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 조회수 불러오기
const getViewCount = async (webtoonId) => {

    let result = {
        success: false,
        viewCount: null
    }

    try {
        await redis.connect();

        if (await redis.exists(VIEWCOUNT)) {
            result.viewCount = await redis.zScore(VIEWCOUNT, webtoonId);
            result.success = true;
        }
        else {
            console.log("webtoon not exist");
        }

        await redis.disconnect();
    }
    catch(err) {
        console.log("error in function getViewCount :", err);
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰에 별점 준 사람 수
const votersCount = async (webtoonId) => {

    const key = webtoonId + VOTERLIST;
    const result = {
        success: false,
        votersCount: null
    }

    try {
        await redis.connect();
        const voters = await redis.sMembers(key);
        result.votersCount = voters.length;
        await redis.disconnect();
        result.success = true;
    }
    catch(err) {
        result.data = -1
        console.log("error in function saveVoters");
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 총 별점에 받은 별점 추가.
const addStar = async (webtoonId, point, voter) => {

    const starKey = webtoonId + STAR;
    const result = {
        success: false,
        totalStar: null
    }

    try {
        await redis.connect();
        
        const voterExist = await redis.sAdd(key, voter);
        if (voterExist > 0) {
            if (await redis.exists(starKey)) {
                result.totalStar = await redis.incrBy(starKey, point);
            }
            else {
                await redis.set(starKey, point);
                result.totalStar = point;
            }
        }
        else {
            console.log("alread voted person")
        }

        await redis.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("error in function addStar :", err);
        await redis.disconnect();
    }

    return result;
}

// 특정 웹툰의 평균 별점(star/voterCount) 불러오기
const getAvgStar = async (webtoonId) => {
    const starKey = webtoonId + STAR;
    const voterKey = webtoonId + VOTERLIST;
    const result = {
        success: false,
        totalStar: null,
        voterCount: null,
        avgStar: null
    }

    try {
        await redis.connect();

        if (await redis.exists(starKey) && await redis.exists(voterKey)) {
            result.totalStar = await redis.get(starKey);
            console.log("totalStar :", result.totalStar);
            const voters = await redis.sMembers(voterKey);
            result.voterCount = voters.length; // 투표자의 수 저장. voters 반환 타입 확인하기
            console.log("voterCount :", result.voterCount);
        }
        else {
            console.log("webtoon has not voters")
        }

        await redis.disconnect();
        result.success = true;
    }
    catch(err) {
        console.log("error in function getAvgStar :", err);
        await redis.disconnect();
    }

    if (result.voterCount != null && result.voterCount > 0) {
        result.avgStar = (result.totalStar/result.voterCount).toFixed(1);
        console.log("avgStar :", result.avgStar);
        result.success;
    }
    else {
        console.log("webtoon has not voters")
    }

    return result;
}

const addHistory = async(webtoonId) => {
    const result = {
        success: false,
        history: []
    }

    try {
        await redis.connect();

        const zScoreResult = await redis.zScore(HISTORY, webtoonId);
        console.log("zScoreResult :", zScoreResult);

        const time = Date.now();//timestamp 이용
        const zHistoryTime = await redis.zAdd(HISTORY, {score: -time, value: webtoonId});
        console.log("historyTime :", zHistoryTime);
        const zHistory = await redis.zRange(HISTORY, 0, 4);
        console.log("history :", zHistory);

        result.success = true;
        await redis.disconnect();
    } catch(err) {
        console.log(err);
        await redis.disconnect();
    }

    return result;
}

module.exports = {
    addViewCount,
    getViewCount,
    votersCount,
    addStar,
    getAvgStar,
    addHistory
};