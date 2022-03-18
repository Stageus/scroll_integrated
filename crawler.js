
const axios = require("axios");
const cheerio = require("cheerio");
// iconv - charset이 utf-8이 아닌 경우 사용

const NAVER = "https://comic.naver.com/webtoon/weekdayList?week=sat"; // mon, tue, wed, thu, fri, sat, sun, dailyplus
const NAVER_LINK = "#content > div.list_area.daily_img > ul > li:nth-child(1) > div > a"; // li:nth-child(n) n에 따라 웹툰 링크 달라짐
const NAVER_CYCLE = ""; // 요일은 요일별 페이지 들어갈 때 정해줄 것
const NAVER_TITLE = "#content > div.comicinfo > div.detail > h2 > span.title";
const NAVER_DETAIL = "#content > div.comicinfo > div.detail > p:nth-child(2)";
const NAVER_THUMBNAIL = "#content > div.comicinfo > div.thumb > a > img";
const NAVER_AUTHOR = "#content > div.comicinfo > div.detail > h2 > span.wrt_nm";
const NAVER_GENRE = "#content > div.comicinfo > div.detail > p.detail_info > span.genre";
const NAVER_PLATFORM = ""; // 플랫폼 별 함수가 다름. 그 함수에서 플랫폼 넣어줄 것

const LEZHIN = "https://www.lezhin.com/ko/scheduled?day=1"; // day=0 ~ 6 : 일 ~ 토, day=n : 열흘
const LEZHIN_LINK = "#scheduled-day-3 > li:nth-child(1) > a";
// #scheduled-day-1 > li:nth-child(1) > a (화요일 1번째 웹툰 링크 선택자)
const LEZHIN_TITLE = "#comic-info > div > h2";
const LEZHIN_DETAIL = "#comic-info-extend > dialog > div.comicInfoExtend__synopsis > p";
const LEZHIN_THUMBNAIL = "#comic-info > picture > img";
const LEZHIN_AUTHOR = "#comic-info > div > div.comicInfo__artist > a";
const LEZHIN_GENRE = "#comic-info > div > div.comicInfo__tags";
const LEZHIN_PLATFORM = "";

const TOOMICS = "https://www.toomics.com/webtoon/weekly/dow/1" // 1 ~ 7 : 월 ~ 일
const TOOMICS_LINK = "#more_list > li:nth-child(1) > a"; // 1번째 웹툰
const TOOMICS_CYCLE = "";
const TOOMICS_TITLE = "#contents > div > div.episode > main > div.episode__header > h2";
const TOOMICS_DETAIL = "#contents > div > div.episode > main > div.episode__header > div.episode__summary";
const TOOMICS_THUMBNAIL = "#contents > div > div.episode > div > div > img";
const TOOMICS_AUTHOR = "#contents > div > div.episode > main > div.episode__header > div:nth-child(2) > dl > dd";
const TOOMICS_GENRE = "#contents > div > div.episode > main > div.episode__header > span";
const TOOMICS_PLATFORM = "";

const TOPTOON = "https://toptoon.com/weekly#weekly1"; // weekly1 ~ weekly7 : 월 ~ 일
const TOPTOON_LINK = "#commonComicList > div > ul.swiper-slide.main-swiper.initialized.swiper-main-active > li:nth-child(1) > a";
const TOPTOON_CYCLE = "";
const TOPTOON_TITLE = "#episodeBnr > div.bnr_episode_info > div:nth-child(1) > div.tit_area.clearfix > p > span > span";
const TOPTOON_DETAIL = "#episodeBnr > div.bnr_episode_info > div:nth-child(1) > div.comic_story.min > p";
const TOPTOON_THUMBNAIL = "#commonComicList > div > ul.swiper-slide.main-swiper.initialized.swiper-main-active > li:nth-child(1) > a > div.thumbbox.swiper-lazy.swiper-lazy-loaded";
const TOPTOON_AUTHOR = "#episodeBnr > div.bnr_episode_info > div:nth-child(1) > div.comic_etc_info > span.comic_wt";
const TOPTOON_GENRE = "#episodeBnr > div.bnr_episode_info > div:nth-child(1) > div.comic_tag";
const TOPTOON_PLATFORM = "";

// 특정 페이지의 html을 가져오는 함수
const crawling = async (url) => {
    console.log("crawler start");
    try {
        return await axios.get(url);
    } catch(err) {
        console.log(err);
    }
};

const naverCrawling = async () => {
    crawling(NAVER)
    .then(html => {
        const $ = cheerio.load(html.data);
        console.log("$ :", $);
        const data = {
            mainContents: $(NAVER_LINK).text(),
            // $(NAVER_LINK).attr('title')
            // $(NAVER_LINK).attr('href')
        };
        return data;
    }).then(res => {
        console.log("res :", res)
    });
}

const lezhinCrawling = async () => {

}

const toomicsCrawling = async () => {
    
}

const toptoonCrawling = async () => {
    
}

const bringWebtoonData = async () => {
    naverCrawling();
    lezhinCrawling();
    toomicsCrawling();
    toptoonCrawling();
}

naverCrawling();

// bringWebtoonData();