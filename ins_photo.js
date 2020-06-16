const request = require('request-promise')
const cheerio = require("cheerio")
const fs = require('fs')
var cookie = 'xxx';
var proxy = 'http://127.0.0.1:1080/pac?auth=S3rQWsbKhxZuIFvYyWzr&t=202006162135580784'
var header = {'cookie':cookie,'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'}
var variablesParams = {"id":"","first":12,"after":""}
var option = {query_hash: 'eddbde960fed6bde675388aac39a3657',variables: ''}
var page = 1 // 页数统计
const start = async (name) => {
    if (page === 1) { await homeData(name)}
    option.variables = JSON.stringify(variablesParams)
    const responseData = await request({ url: 'https://www.instagram.com/graphql/query/',qs: option,proxy:proxy,header: header,json:true});
    const responsData = responseData.data.user.edge_owner_to_timeline_media
    const urls = []
    responsData && responsData.edges.forEach( x => {
        if (x.node.video_url) {urls.push(x.node.video_url)}
        if (x.node.edge_sidecar_to_children) {
            x.node.edge_sidecar_to_children.edges.forEach( m => { urls.push(m.node.display_url) })
        } else urls.push(x.node.display_url)
    })
    console.log(`<---------------------------------开始下载${name}第${page}页数据--------------------------------->`)
    for (let e of urls) {let r = await down(e,name);console.log(r)}
    if (responsData.page_info.has_next_page) {
        variablesParams.after = responsData.page_info.end_cursor      
        page++;
        await start(name).then()
    } else {
        page = 1
        return
    } 
};

const homeData = async (name) => {
    // 获取首页数据及ajax参数
    const responseFirstData = await request.get(`https://www.instagram.com/${name}`,{headers:header,proxy:proxy,})
    const $ = cheerio.load(responseFirstData)
    $('script').each(function(indexInArray) {    
        if ($('script').eq(indexInArray).html().indexOf("window._sharedData") == 0) {    
            let dataParams = $('script').eq(indexInArray).html()
            let dataf = dataParams.substring(20)
            let datae = JSON.parse(dataf.substring(0,dataf.length -1))
            let endCursor = datae.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.page_info.end_cursor   
            let userId = datae.entry_data.ProfilePage[0].graphql.user.id
            variablesParams.id = userId
            variablesParams.after = endCursor
            option.variables = JSON.stringify(variablesParams)
        }    
    })  
}

const creatFile = async (screen_name) => {
    return new Promise((resolve) => {
        fs.exists(`./${screen_name}`, (exists) => {
            if (!exists) {fs.mkdir(`./${screen_name}`,(err) =>{});resolve()}
            if (exists) {resolve()}
        });
    })
};

const down = async (m,name) => {
    await creatFile(name)
    return new Promise((resolve,reject) => {
        request({url:m,headers:header,proxy:proxy}).pipe(fs.createWriteStream(`./${name}/${(new Date()).valueOf()}.${m.split('?')[0].split('.').pop()}`,{ 'enconding':'binary'})
            .on("error", (e) => {reject('下载失败:' + e)})
            .on("finish", () => {resolve("下载成功" + m);})
            .on("close", () => {})
        )
    })
};

async function startUp () {
    for (let i = 0; i < characterName.length; i++) {
        await start(characterName[i])
    }
}

const characterName = [
    'odriver6666',
    'bijo_labo',
    'ulzzanggirltown',
    'joannalin724',
    'silveryiyi_m',
    'onefm881',
    'shirahoshi.natsumi',
    'bijo_labo',
    'kingjames',
    'mika780611',
    'coffee89921',
    'shasha_soosoo_'
];
// 爬取人名 
// const popularName = async () => {
//    const d = await request({url:'https://www.instagram.com/explore/grid',qs:{
//     'is_prefetch': false,
//     'omit_cover_media': false,
//     'module': 'explore_popular',
//     'use_sectional_payload': true,
//     'cluster_id': 'explore_all:0',
//     'include_fixed_destinations': true,
//     'max_id': 0
//    },headers:header,json:true})
//    d.sectional_items.forEach( x => {
//        if (x.feed_type === 'channel') {
//             x.layout_content.fill_items.forEach(n => {
//                 characterName.push(n.media.caption.user.username)
//             })
//             characterName.push( x.layout_content.two_by_two_item.channel.media.caption.user.username)
//        } else if (x.feed_type === 'media') {
//             x.layout_content.medias && x.layout_content.medias.forEach(k => {
//                 characterName.push(k.media.caption.user.username)
//             })
//             x.layout_content.fill_items && x.layout_content.fill_items.forEach(n => {
//                 characterName.push(n.media.user.username)
//             })
//             x.layout_content.two_by_two_item && characterName.push( x.layout_content.two_by_two_item.media.caption.user.username)
//             x.layout_content.one_by_two_item && characterName.push( x.layout_content.one_by_two_item.stories.seed_reel.user.username)
//        }
//    })
//    console.log(characterName)
// }
// popularName()
startUp().then();
