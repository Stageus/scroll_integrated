
const pg = require("./pgRequest");
const redis = require("redis").createClient();

const VIEWCOUNT = "viewcount";
const STAR = "star";
const VOTERLIST = "voteId";

const upload = async () => {

    // webtoonID 리스트 가져오기
    const sql = "SELECT webtoonID FROM webtoon;";
    let webtoonData = null;
    try {
        webtoonData = await pg(sql, null);
    } catch(err) {
        console.log("redis to postgres upload err :", err);
    }
    const webtoonIdList = webtoonData.data;

    // viewCount 저장
    let viewCountData = null;
    try {
        redis.connect();
        // viewCountData = 
    } catch(err) {

    }
    let viewCountList = null;

    if (webtoonData.success) {
        webtoonIdList = webtoonData.data;

        const totalStars = [];
        const voterList = await redis.sMembers(VOTERLIST);
    }
    else {

    }
};