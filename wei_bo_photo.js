const request = require('request-promise')
const fs = require('fs')

var cookie = '_T_WM=16413697197; WEIBOCN_FROM=1110003030; MLOGIN=1; ALF=1594701105; SCF=Av9bmaqRBaNUVUMhQEi_9DrUXYLTsdI_9Svs9mBc-4lO0AIECzmkTJaItoWLPJIod8sN0H3BiJFiCGfiF9vZPOc.; SUB=_2A25z4dhjDeRhGeVG4lUY9izIyziIHXVRLfgrrDV6PUJbktANLVfXkW1NT2tQ4Yt6M3VD7NyhUAiOyPFewHgmGPpN; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhaYo8bc97dDM.scgjf.s5y5JpX5K-hUgL.FoeR1KM4SozXehB2dJLoIXnLxKqL1hnL1K2LxK-LB--LBoqLxKqL1-eL1h.LxK-L12qLB-2LxK-L1h-L1KBLxK-LB--L1-BLxK-LB--L1-BLxKBLBonLBoqt; SUHB=0nluXpBI0t9Bx9; SSOLoginState=1592109107; XSRF-TOKEN=235499; M_WEIBOCN_PARAMS=luicode%3D10000011%26lfid%3D1078031195242865';

// 获取所有人物链接数组（包含姓名 链接 图片总数）
var result = [];

// 人物跳转链接参数对象
var params = {};

const start = async () => {
    for (let i = 0; i < characterName.length; i++) {
        const responseData = await request({
            url: 'https://m.weibo.cn/api/container/getIndex',
            qs: {containerid: `100103type=3&q=${characterName[i]}&t=0`, page_type: 'searchall'},
            json:true
        });
        // 过滤数组只保留列表数据
        const currentNameData = responseData.data.cards.filter( x => x.card_type === 11)[0].card_group;
        // 得到与关键字匹配的数据(跳转链接及名称)
        const getCurrentNameFirst = currentNameData[0];
        getParams(getCurrentNameFirst.user.profile_url)
        // 根据跳转链接获取图片总数
        const responseImg = await request({
            url: 'https://m.weibo.cn/api/container/getIndex',
            qs: {uid: params.uid, t: 0, luicode: params.luicode, lfid: params.lfid, containerid: `107803${params.uid}`},
            json:true
        });
        let imgTotal = responseImg.data.cards[0].title.match(/\(([^)]*)\)/)[1]
        console.log(getCurrentNameFirst.user.screen_name,getCurrentNameFirst.user.profile_url,imgTotal)
        result.push({profile_url:getCurrentNameFirst.user.profile_url,screen_name:getCurrentNameFirst.user.screen_name,img_total:imgTotal})
    }
    for (let n = 0; n < result.length; n++) {
        const getPage = Math.ceil(Number(result[n].img_total)/24)
        for (let i = 1; i <= getPage; i++) {
            getParams(result[n].profile_url)
            console.log(`开始爬取${result[n].screen_name}第${i}页`);
            const responseData = await request({
                url: 'https://m.weibo.cn/api/container/getSecond',
                qs: {
                    containerid: `107803${params.uid}_-_photoall`,
                    count: '24',
                    page: i,
                    title: '图片墙',
                    luicode: params.luicode,
                    lfid: `107803${params.uid}`
                },
                headers: {
                    'cookie':cookie,
                    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
                },
                json:true
            });
            const baseData = responseData &&  responseData.data.cards;
            const imgUrl = []  // 图片数组
            baseData && baseData.forEach ( n => {n.pics.forEach ( z => {imgUrl.push(z.pic_big)})});
            for (let m of imgUrl) {
                let r = await downImg(m,result[n].screen_name);
                console.log(r)
            }
        }
    }
};

const wait = (ms) => {return new Promise(resolve => setTimeout(() => resolve(), ms))};

const creatFile = async (screen_name) => {
    return new Promise((resolve) => {
        fs.exists(`./${screen_name}`, (exists) => {
            if (!exists) {fs.mkdir(`./${screen_name}`,(err) =>{});resolve()}
            if (exists) {resolve()}
        });
    })
};

const downImg = async (m,screen_name) => {
    await creatFile(screen_name)
    return new Promise((resolve,reject) => {
        request(m).pipe(fs.createWriteStream(`./${screen_name}/${(new Date()).valueOf()}.${m.split('.').pop()}`,{ 'enconding':'binary'})
            .on("error", (e) => {reject('下载失败:' + e)})
            .on("finish", () => {resolve("下载成功" + m);})
            .on("close", () => {})
        )
    })
};

// 人物链接参数解析方法
const getParams = (url) => {
    url.split('?')[1].split('&').forEach( x => {
        let h = x.split('=');
        params[h[0]] = h[1]
    })
};

const characterName = ['迪丽热巴','刘亦菲','王艺瑾'];

start().then();
