
const axios = require("axios");
const cheerio = require("cheerio");
// iconv - charset이 utf-8이 아닌 경우 사용

const NAVER = "naver url";

// 각 플랫폼의 웹툰 정보를 가져오는 내용
const crawling = async (url) => {
    console.log("crawler start");
    try {
        return await axios.get(url);
    } catch(err) {
        console.log(err);
    }
};

crawling()
.then(html => {
    console.log(html);
    const $ = cheerio.load(html.data);
    const data = {
        mainContents: $('선택자').text(),
    };
    return data;
})
.then(res => console.log(res));
