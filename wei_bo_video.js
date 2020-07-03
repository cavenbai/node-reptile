const request = require('request-promise')
const fs = require('fs')

var cookie = 'xxx';

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
        if (currentNameData && currentNameData.length > 0) {
            const getCurrentNameFirst = currentNameData[0];
            console.log(getCurrentNameFirst.user.screen_name,getCurrentNameFirst.user.profile_url)
            result.push({profile_url:getCurrentNameFirst.user.profile_url,screen_name:getCurrentNameFirst.user.screen_name})
        }
    }
    for (let n = 0; n < result.length; n++) {
        console.log(`<---------------------------------开始下载${result[n].screen_name}视频数据--------------------------------->`)
        getParams(result[n].profile_url)
        await startDownLoad(result[n].screen_name)
    }
};

const startDownLoad = async (name) => {
    const responseData = await request({
        url: 'https://m.weibo.cn/api/container/getIndex',
        qs: {
            uid: params.uid,
            luicode: params.luicode,
            lfid: params.lfid,
            type: 'uid',
            value: params.uid,
            containerid: `231567${params.uid}`,
            since_id: params.since_id || ''
        },
        headers: {
            'cookie':cookie,
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        },
        json:true
    });
    const urls = []
    responseData.data.cards.forEach( x => {
        const url = x.mblog.page_info.media_info.mp4_hd_url;
        const name = x.mblog.page_info.media_info.titles ? x.mblog.page_info.media_info.titles[0].title :  x.mblog.page_info.media_info.next_title;
        urls.push({url:url,name:name}) 
    }) 
    for (let e of urls) {let r = await downImg(e,name);console.log(r)}
    if (responseData.data.cardlistInfo.since_id) {
        params.since_id = responseData.data.cardlistInfo.since_id
        await startDownLoad(name).then()
    } else {
        return
    }
}

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
        request(m).pipe(fs.createWriteStream(`./${screen_name}/${m.name}.mp4`,{ 'enconding':'binary'})
            .on("error", (e) => {reject('下载失败:' + e)})
            .on("finish", () => {resolve("下载成功" + "---视频名称：" + m.name + "---");})
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

const characterName = ['这是最后一片疯狂',"牙牙971"];

start().then();
