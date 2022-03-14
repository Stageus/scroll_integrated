
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

    // redis의 조회수, 총 별점, 투표자 리스트 DB에 저장
    try {
        redis.connect();
        for (let index = 0; index < webtoonIdList.length; index++) {
            const tempViewCount = await redis.zScore(VIEWCOUNT, webtoonIdList[index]);
            const tempTotalStar = await redis.get(webtoonIdList[index] + STAR);
            const sql2 = "UPDATE webtoon SET viewCount=$1, totalStar=$2 WHERE webtoonID=$3;";
            await pg(sql2, [tempViewCount, tempTotalStar, webtoonIdList[index]]);

            const tempVoterList = await redis.sMembers(webtoonIdList[index] + VOTERLIST);
            const sql3 = "INSERT INTO voter (memberID, webtoonID) VALUES ($1, $2) ON CONFLICT (memberID, webtoonID) DO NOTHING;";
            for (let index2 = 0; index2 < tempVoterList.length; index2++) {
                await pg(sql3, [tempVoterList[index2], webtoonIdList[index]]);
            }
        }
        redis.disconnect();
    } catch (err) {
        console.log(err);
    }
};

upload();