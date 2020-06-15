const request = require('request-promise')
const fs = require('fs')

var cookie = 'ig_cb=1; ig_did=5E08F81D-5F5F-4B06-8848-20974CB4DEF5; mid=XuTX3gALAAGhDIfiYZwgtmfvcNdi; csrftoken=Isx8Kcx8rmdYICXJ85JhcC8HZ9yupj8o; ds_user_id=9973078569; sessionid=9973078569%3A85ZJAMkl65TXzH%3A13; shbid=15643; shbts=1592055863.1224487; urlgen="{\\"178.128.186.198\\": 14061\\054 \\"161.35.39.229\\": 14061\\054 \\"133.18.208.83\\": 24282}:1jkr6J:TjKv66Bx_B1xV3WTLq-HJzttfGw"';
var proxy = 'http://127.0.0.1:1080/pac?auth=S3rQWsbKhxZuIFvYyWzr&t=202006160000374167'
var variablesParams = {"id":"5923076936","first":12,"after":"QVFBT0pnSGdoUDJiSFp5SGVQRG5pWUVoMlZmUWZuVkpjYVpSbXNhUnZvTEZQNFJ4U2V3S0RIRHF2RUY2Y2FfWl80N1RkVExWQ3RadTRPb2hiMVFnd3ZFQg=="}
var option = {
    query_hash: 'eddbde960fed6bde675388aac39a3657',
    variables: ''
}
var page = 1
const start = async () => {
    option.variables = JSON.stringify(variablesParams)
    const responseData = await request({
        url: 'https://www.instagram.com/graphql/query/',
        qs: option,
        // header: {cookie:cookie},
        proxy: proxy,
        json:true
    });
    const responsData = responseData.data.user.edge_owner_to_timeline_media
    if (responsData.page_info.has_next_page) {
        variablesParams.after = responsData.page_info.end_cursor
        let urls = []
        responsData.edges.forEach( x => {
            if (x.node.video_url) {urls.push(x.node.video_url)}
            if (x.node.edge_sidecar_to_children) {
                x.node.edge_sidecar_to_children.edges.forEach( m => {
                    urls.push(m.node.display_url)
                })
            } else {
                urls.push(x.node.display_url)
            }
        })
        console.log(`开始下载第${page}页数据`)
        for (let e of urls) {
            let r = await down(e);
            console.log(r)
        }
        page++;
        start().then()
    }
};

const down = async (m) => {
    return new Promise((resolve,reject) => {
        request({url:m,proxy:proxy,}).pipe(fs.createWriteStream(`./img/${(new Date()).valueOf()}.${m.split('?')[0].split('.').pop()}`,{ 'enconding':'binary'})
            .on("error", (e) => {reject('下载失败:' + e)})
            .on("finish", () => {resolve("下载成功" + m);})
            .on("close", () => {})
        )
    })
};




start().then();
