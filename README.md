# node-reptile (node环境-爬取微博相册图片)
## 项目安装
```
npm install
```
## 项目运行
```
node (脚本名)$1
```
## 项目说明
### 微博照片爬取
```
- 支持多人爬取：初始化 characterName = ['王宝抢','刘亦肥','刘的读'];
- cookie初始化（自己在微博登录copy cookie到本地）
- 下载的文件会根据characterName自动创建对应的图片文件夹
```

### instagram用户照片爬取
```
- 支持多用户爬取：初始化 characterName = ['王宝抢','刘亦肥','刘的读'];注：该名称为搜索准确人名
- 若设置代理请求，初始化全局proxy 并在每处request添加 proxy:proxy。(请文明上网)
- cookie初始化（登录ins账号copy cookie到本地）
- 下载的文件会根据characterName自动创建对应的图片文件夹
- query_hash参数不重要，随便找个就可以
