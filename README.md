# 十二生肖盲盒 · 纳福珍藏

在现有 Next.js 项目上升级的全中文虚拟生肖盲盒体验。保留原始十三张产品图片、公平随机开盒、动画、音效、分享和本地收藏。

## 在线体验与分享

- 网站：https://zodiac-mystery-blindbox.onrender.com
- GitHub：https://github.com/thurein2003/Chineses-traditional-keysChain-BlindBox
- 二维码：[PNG 图片](public/share/zodiac-qr.png) · [SVG 矢量图](public/share/zodiac-qr.svg)

![扫描二维码体验十二生肖盲盒](public/share/zodiac-qr.png)

Render 免费实例空闲 15 分钟后会休眠，之后首次访问通常需要约一分钟唤醒，详见 [Render 免费服务说明](https://render.com/docs/free#spinning-down-on-idle)。收藏保存在当前浏览器中；更换设备或网站来源不会自动同步。上线模型应提交到仓库的 `public/models/` 后重新部署。

## 本地运行

需要 Node.js 20.9 或以上版本，建议使用 22 或 24 LTS。

```sh
npm install
npm run dev
```

访问 http://localhost:3000。生产运行：先停止占用 3000 端口的开发进程，再执行：

```sh
npm run build
npm start
```

生产服务器默认监听 `0.0.0.0:3000`，设置 `PORT` 环境变量时自动使用主机分配的端口。仓库包含 Render 的 `render.yaml`，使用新加坡区域免费 Node.js 服务；`.node-version` 固定 Node.js 24 LTS。当前服务通过公开仓库 URL 连接，后续推送需要在 [Render 控制台](https://dashboard.render.com/web/srv-dbma0fp42hec73e3d62g) 选择 Manual Deploy → Deploy latest commit。连接 GitHub 提供商并授权此仓库后，可使用配置中的自动部署，参见 [Render 部署说明](https://render.com/docs/deploys)。

## 本次升级

- 页面语言为 `zh-CN`，导航、按钮、动画提示、分享、加载、错误页、辅助标签和网页元数据均使用简体中文。
- `src/data/zodiacMeanings.ts` 集中保存十二生肖的地支、名称、象征寓意、性格意象、文化解释、幸运祝福及图片和模型路径。内容采用用户提供的原文，仅表达传统文化意象，不用于根据出生年份预测个性。
- 红金生肖中奖卡展示原始实物照片、全部文化内容和收藏、分享、再次开盒操作。手机采用可滚动布局，优先保证文字易读。
- 收藏页保留全部十二张原图，展示解锁状态、获得次数和文化寓意。原有版本化 localStorage 数据继续兼容，不改变生肖 ID 或清空已有收藏。
- 详情展台提供实物照片与立体模型切换，支持鼠标和触摸旋转、滚轮和双指缩放、自动旋转、重置视角、双击重置及全屏。
- 音效默认关闭，只在明确交互后合成播放；动效遵循系统减少动态效果偏好。手机设置菜单同样可调整音效和动效。

## 毛绒模型与质量边界

十二生肖仍分别由 `ZodiacRat.tsx` 等独立组件分派，底层共享新的软体曲面和工艺组件。

`PlushMaterials.tsx` 使用自定义参数曲面塑造头部、坐姿身体、耳朵、口鼻和手足，配合程序化织物凹凸纹理、物理织物光泽和交叉绒毛纤维几何。`PlushCharacter.tsx` 提供可见缝线、刺绣口鼻、反光安全眼、真实汉字纹理、红绳中国结、金属环链、铃铛、生肖铭牌及各自专属配件。

专属配件包括：鼠与鸡的元宝，牛、羊、猪的福字锦囊，虎的锦鲤，兔的胡萝卜，龙的珍珠与祥云，蛇的金葫芦，马的马蹄铁，猴的香蕉，狗的骨头。模型轮廓、配色、耳角、鬃毛、尾巴和坐姿均对照各自的原始照片制作。

展台采用本地生成的摄影棚反射环境、主光、柔和补光、轮廓光、接触阴影、ACES 色调映射和正确的颜色空间。无需远程 HDR 或字体。手机减少绒毛密度，性能监测动态调整像素比；离开展台时回收当前模型的几何和字形纹理。

**这些是经过细化的程序化艺术演绎，并非实物扫描或专业摄影级模型。** 单张照片无法确定背面、内部缝合及全部布料细节。照片模式始终展示未经替换的真实原图；界面明确标注程序化模型。

## GLB 优先加载

目前项目未提供任何正式 GLB/GLTF 模型，十二生肖均使用程序化演绎。将外部制作的精细模型放入：

```text
public/models/rat.glb
public/models/ox.glb
public/models/tiger.glb
public/models/rabbit.glb
public/models/dragon.glb
public/models/snake.glb
public/models/horse.glb
public/models/goat.glb
public/models/monkey.glb
public/models/rooster.glb
public/models/dog.glb
public/models/pig.glb
```

也支持相同名称的 `.gltf`；两种格式同时存在时优先 GLB。GLTF 引用的二进制文件和纹理应保留正确相对目录。模型发现端点 `/api/models` 不缓存，每次打开详情都会检查；动态资源路由支持生产服务器启动后新增文件。

加载器保留原始 PBR 材质和纹理，正确复制骨架，自动居中并等比缩放。外部模型加载期间继续显示程序化模型；失败时回退并给出中文提示，避免空白展台。

## 原始图片

全部文件位于 `public/assets/zodiac/`，保留精确大小写，不使用替代的库存插画或生成动物图像。

| 生肖 | 文件        |
| ---- | ----------- |
| 子鼠 | mouse.jpg   |
| 丑牛 | Cow.jpg     |
| 寅虎 | Tiger.jpg   |
| 卯兔 | rabbit.jpg  |
| 辰龙 | Dragon.jpg  |
| 巳蛇 | Snake.jpg   |
| 午马 | Horse.jpg   |
| 未羊 | Sheep.jpg   |
| 申猴 | Monkey.jpg  |
| 酉鸡 | Chicken.jpg |
| 戌狗 | Dog.jpg     |
| 亥猪 | Pig.jpg     |

`Box.jpg` 用于真实立体盒子的正面 UV 贴图，侧面和可开启的厚实盒盖采用红金材质。该文件先前已被替换为保留 `.jpg` 文件名的 512×512 WebP 图片；应用保留其原始字节，浏览器可正常解码。实物照片不经过重绘或图像压缩优化。图片原路径通过内部重写交由完整读取接口输出；接口校验完整字节数、处理短读取并缓存原始字节，避免本机文件系统偶发截断静态流式响应。源文件变化时会刷新缓存。

## 随机与收藏

每个生肖均为十二分之一概率。使用浏览器 `crypto.getRandomValues` 和拒绝采样去除取模偏差，不受所选盲盒位置影响。一次已接受的开盒只产生一个固定结果，动画期间锁定输入。

点击“加入我的收藏”立即保存；关闭中奖卡或再开一盒也会将当前结果保存一次。重复抽中会增加次数。数据仅保存在当前设备和浏览器的当前站点来源中，不发送至服务器。重置收藏需要确认。虚拟收藏不涉及实物奖品或发货。

## 验证

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

针对已部署的网站运行浏览器流程验证：

```sh
PLAYWRIGHT_BASE_URL=https://zodiac-mystery-blindbox.onrender.com npm run test:e2e
```

远程验证会跳过需要直接写入服务器模型目录的本地 GLB/GLTF 注入测试；该项在本地执行。

测试覆盖原始资源字节与文件名、全部文化数据、曲面与纤维坐标、公平抽取、动画状态及重复点击保护、正确中奖图文、收藏持久化与异常恢复、十二生肖展台、照片切换、触摸与鼠标控制、模型自动加载、中文与辅助标签、减少动态效果及五种屏幕尺寸。浏览器测试中的受控抽取只存在于测试初始化中，应用实际抽取始终使用浏览器随机数。

升级截图位于 `artifacts/screenshots/`：首页、生肖中奖卡、生肖立体展示及生肖收藏。浏览器测试报告位于 `playwright-report/`。

## 主要文件

```text
src/data/zodiacMeanings.ts              十二生肖完整文化数据
src/data/zodiac.ts                      产品、图片与展示配置
src/components/CulturalDetails.tsx      共用文化信息与祝福卡
src/components/Reward.tsx               中文中奖卡、收藏及分享
src/components/Viewer.tsx               照片与立体文化展台
src/components/Home.tsx                 中文首页与开盒流程
src/components/Header.tsx               中文导航和桌面／手机设置
src/components/Collection.tsx           中文收藏、寓意与获得次数
src/app/layout.tsx                      页面语言及中文元数据
src/app/globals.css                     中文排版、中奖卡与响应式展台
src/app/error.tsx                       中文错误恢复
src/app/not-found.tsx                   中文未找到页面
src/components/three/PlushMaterials.tsx  软体曲面、绒毛与布料材质
src/components/three/PlushCharacter.tsx  面部、配件及毛绒结构
src/components/three/ToyScene.tsx        模型加载、灯光与交互
src/stores/collection.ts                保留兼容的本地收藏
src/lib/readCompleteFile.ts             处理短读取与提前结束，校验完整原始字节
src/app/api/zodiac-assets/              原图完整输出与内存缓存
next.config.ts                         保留原图 URL 的内部重写
```

如果项目存放在云同步目录，构建前应将整个项目设为保留本地下载，避免源文件或图片变为仅在线的占位文件。图片接口会在完整校验后缓存原始字节；原文件更新时会刷新缓存。

可部署至支持 Node.js 的 Next.js 主机；本地模型发现与动态资源读取需要服务器文件系统，当前没有配置为纯静态导出。
