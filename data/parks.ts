// 台灣公園探索 - 資料模型與範例資料

export type ParkCategory = "walk" | "inclusive" | "slide" | "pet" | "bike";

export interface ParkReview {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
}

export interface Park {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  categories: ParkCategory[];
  funRating: number; // 1-5 average
  reviewCount: number;
  description: string;
  facilities: string[];
  googleMapsUrl: string;
  reviews: ParkReview[];
}

export const CATEGORY_LABELS: Record<ParkCategory, string> = {
  walk: "單純散步",
  inclusive: "共融式",
  slide: "簡單溜滑梯",
  pet: "寵物",
  bike: "滑步車",
};

export const CATEGORY_COLORS: Record<ParkCategory, string> = {
  walk: "#2D7A3E",
  inclusive: "#4A90D9",
  slide: "#F5A623",
  pet: "#8B5E3C",
  bike: "#E8554E",
};

export const CATEGORY_ICONS: Record<ParkCategory, string> = {
  walk: "directions-walk",
  inclusive: "accessible",
  slide: "child-care",
  pet: "pets",
  bike: "directions-bike",
};

export const CITIES = [
  "全部", "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
  "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣",
  "澎湖縣", "金門縣", "連江縣",
];

export const TAIWAN_PARKS: Park[] = [
  {
    id: "p001",
    name: "大安森林公園",
    city: "台北市",
    district: "大安區",
    address: "台北市大安區新生南路二段1號",
    categories: ["walk", "bike"],
    funRating: 4,
    reviewCount: 28,
    description: "台北市最大的都會公園，擁有大片草坪、林蔭步道與生態池，適合散步、野餐與騎自行車。園內有豐富的鳥類生態，是都市中的綠洲。",
    facilities: ["步道", "草坪", "生態池", "自行車道", "涼亭", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=大安森林公園",
    reviews: [
      { id: "r001", author: "小明", rating: 5, comment: "很大的公園，適合帶小孩來放電，生態池有很多鳥可以看！", date: "2025-06-15" },
      { id: "r002", author: "愛散步的阿伯", rating: 4, comment: "步道很舒適，早上來散步很棒，但假日人比較多。", date: "2025-06-10" },
    ],
  },
  {
    id: "p002",
    name: "榮星花園公園",
    city: "台北市",
    district: "中山區",
    address: "台北市中山區龍江街6號",
    categories: ["inclusive", "walk"],
    funRating: 5,
    reviewCount: 42,
    description: "共融式遊戲場的先驅，設有無障礙遊具、沙坑、攀爬設施與體健設施。花園內有美麗的九重楹花海，是親子遊玩的熱門地點。",
    facilities: ["共融式遊具", "沙坑", "攀爬架", "體健設施", "步道", "花園", "無障礙設施", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=榮星花園公園",
    reviews: [
      { id: "r003", author: "親子媽咪", rating: 5, comment: "共融遊具超讚！輪椅也能玩的旋轉盤，小孩玩到不想走。", date: "2025-07-01" },
      { id: "r004", author: "阿倫", rating: 5, comment: "沙坑很乾淨，攀爬設施很有挑戰性，推薦！", date: "2025-06-28" },
    ],
  },
  {
    id: "p003",
    name: "中央公園",
    city: "台中市",
    district: "西屯區",
    address: "台中市西屯區中科路2966號",
    categories: ["walk", "inclusive", "bike"],
    funRating: 5,
    reviewCount: 35,
    description: "水湳經貿園區內的大型公園，結合生態、文化與遊憩。設有共融式遊戲場、親子廁所、大片草坪與人工濕地，是台中最受歡迎的公園之一。",
    facilities: ["共融式遊具", "人工濕地", "步道", "自行車道", "親子廁所", "停車場", "無障礙設施"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=台中市中央公園",
    reviews: [
      { id: "r005", author: "台中阿宏", rating: 5, comment: "很大很漂亮，共融遊具設計得很好，停車也方便。", date: "2025-07-05" },
      { id: "r006", author: "小芳", rating: 4, comment: "濕地生態很豐富，但夏天太熱建議傍晚去。", date: "2025-06-20" },
    ],
  },
  {
    id: "p004",
    name: "中都濕地公園",
    city: "高雄市",
    district: "三民區",
    address: "高雄市三民區九如一路",
    categories: ["walk", "pet"],
    funRating: 4,
    reviewCount: 18,
    description: "結合濕地生態與公園綠地，有完善的步道系統與寵物友善區域。園內有紅樹林生態與多種水鳥，是散步與遛狗的好去處。",
    facilities: ["濕地步道", "寵物活動區", "草坪", "生態觀察區", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=中都濕地公園高雄",
    reviews: [
      { id: "r007", author: "毛孩爸", rating: 5, comment: "寵物區很寬敞，狗狗跑得很開心！濕地步道也很舒服。", date: "2025-06-25" },
    ],
  },
  {
    id: "p005",
    name: "四四南村簡單公園",
    city: "台北市",
    district: "信義區",
    address: "台北市信義區松勤街50號",
    categories: ["slide", "walk"],
    funRating: 3,
    reviewCount: 12,
    description: "位於101旁的眷村文化公園，有簡單的溜滑梯與開放空間，結合文創市集與歷史建築，適合親子輕鬆遊玩。",
    facilities: ["溜滑梯", "開放草坪", "眷村文化區", "市集廣場", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=四四南村",
    reviews: [
      { id: "r008", author: "信義媽媽", rating: 3, comment: "溜滑梯比較小，適合幼兒。假日有市集可以逛，整體不錯。", date: "2025-06-18" },
    ],
  },
  {
    id: "p006",
    name: "河濱公園自行車道",
    city: "新北市",
    district: "板橋區",
    address: "新北市板橋區環河西路",
    categories: ["bike", "walk"],
    funRating: 4,
    reviewCount: 22,
    description: "大漢溪與新店溪沿岸的河濱公園，有長達數公里的自行車道與廣闊草坪。適合滑步車、自行車練習與河岸散步，夕陽景色優美。",
    facilities: ["自行車道", "滑步車場地", "河岸步道", "草坪", "籃球場", "公共廁所", "停車場"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=板橋河濱公園",
    reviews: [
      { id: "r009", author: "單車騎士", rating: 5, comment: "車道很平坦，適合帶小朋友騎滑步車，夕陽超美！", date: "2025-07-03" },
      { id: "r010", author: "散步愛好者", rating: 4, comment: "河岸步道很長，走起來很舒服，但夏天要注意防曬。", date: "2025-06-22" },
    ],
  },
  {
    id: "p007",
    name: "青年公園",
    city: "台北市",
    district: "萬華區",
    address: "台北市萬華區水源路199號",
    categories: ["walk", "slide", "pet"],
    funRating: 4,
    reviewCount: 30,
    description: "台北市面積最大的公園之一，設有兒童遊樂區、體健設施、游泳池與寵物活動區。遊具種類豐富，適合各年齡層使用。",
    facilities: ["溜滑梯", "盪鞦韆", "體健設施", "游泳池", "寵物區", "步道", "公共廁所", "停車場"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=青年公園台北",
    reviews: [
      { id: "r011", author: "萬華阿嬤", rating: 4, comment: "遊具很多，孫子很喜歡來玩。早上來運動的人很多。", date: "2025-06-30" },
      { id: "r012", author: "狗狗主人", rating: 4, comment: "寵物區不錯，但要注意清潔。整體公園很大很好逛。", date: "2025-06-15" },
    ],
  },
  {
    id: "p008",
    name: "美堤河濱公園",
    city: "台北市",
    district: "內湖區",
    address: "台北市內湖區基隆河畔",
    categories: ["bike", "walk", "pet"],
    funRating: 4,
    reviewCount: 25,
    description: "基隆河畔的大型河濱公園，有寬敞的自行車道、大草坪與寵物友善區域。可遠眺101大樓，是內湖居民最愛的休閒去處。",
    facilities: ["自行車道", "大草坪", "寵物活動區", "河岸步道", "壘球場", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=美堤河濱公園",
    reviews: [
      { id: "r013", author: "內湖居民", rating: 4, comment: "傍晚來騎車很舒服，草坪很大可以放風箏。", date: "2025-07-02" },
    ],
  },
  {
    id: "p009",
    name: "南港公園",
    city: "台北市",
    district: "南港區",
    address: "台北市南港區東新街170號",
    categories: ["inclusive", "walk", "slide"],
    funRating: 5,
    reviewCount: 38,
    description: "設有共融式遊戲場，包含無障礙旋轉盤、攀爬丘、沙坑與水遊戲區。公園內有生態池與環湖步道，是南港區最受歡迎的親子公園。",
    facilities: ["共融式遊具", "沙坑", "水遊戲區", "攀爬丘", "環湖步道", "生態池", "無障礙設施", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=南港公園",
    reviews: [
      { id: "r014", author: "南港媽咪", rating: 5, comment: "共融遊具超好玩！水遊戲區夏天超消暑，小孩玩到不想走。", date: "2025-07-08" },
      { id: "r015", author: "阿德", rating: 5, comment: "環湖步道很漂亮，散步很舒服。遊具設計很有創意。", date: "2025-06-28" },
    ],
  },
  {
    id: "p010",
    name: "左鎮公園",
    city: "台南市",
    district: "左鎮區",
    address: "台南市左鎮區",
    categories: ["walk", "pet"],
    funRating: 3,
    reviewCount: 8,
    description: "位於台南近郊的社區公園，有簡單步道與開放草坪，適合散步與遛狗。環境清幽，適合喜歡安靜的民眾。",
    facilities: ["步道", "開放草坪", "涼亭"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=左鎮公園台南",
    reviews: [
      { id: "r016", author: "台南鄉親", rating: 3, comment: "小巧安靜的公園，適合帶狗狗來散步，但設施不多。", date: "2025-06-12" },
    ],
  },
  {
    id: "p011",
    name: "澄清湖風景區",
    city: "高雄市",
    district: "鳥松區",
    address: "高雄市鳥松區澄清路832號",
    categories: ["walk", "bike"],
    funRating: 5,
    reviewCount: 45,
    description: "高雄最大的湖泊風景區，有環湖步道、自行車道與豐富的自然生態。湖光山色優美，是高雄市民週末出遊的首選。",
    facilities: ["環湖步道", "自行車道", "觀景台", "草坪", "停車場", "餐飲區", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=澄清湖高雄",
    reviews: [
      { id: "r017", author: "高雄阿明", rating: 5, comment: "環湖步道很漂亮，騎自行車繞一圈超讚！風景很美。", date: "2025-07-06" },
      { id: "r018", author: "攝影愛好者", rating: 5, comment: "清晨來拍照光線最美，湖面倒影超漂亮。", date: "2025-06-25" },
    ],
  },
  {
    id: "p012",
    name: "大魯閣草衙道滑步車場",
    city: "高雄市",
    district: "前鎮區",
    address: "高雄市前鎮區中安路1之1號",
    categories: ["bike", "slide"],
    funRating: 4,
    reviewCount: 15,
    description: "草衙道附近有適合滑步車練習的開放空間，搭配簡單兒童遊具。鄰近商場，適合親子一日遊。",
    facilities: ["滑步車場地", "溜滑梯", "開放空間", "停車場", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=大魯閣草衙道",
    reviews: [
      { id: "r019", author: "滑步車爸", rating: 4, comment: "場地平坦適合練習，逛完商場帶小孩來放電剛好。", date: "2025-06-20" },
    ],
  },
  {
    id: "p013",
    name: "碧湖公園",
    city: "台北市",
    district: "內湖區",
    address: "台北市內湖區內湖路二段",
    categories: ["walk", "pet", "inclusive"],
    funRating: 4,
    reviewCount: 27,
    description: "以碧湖為中心的公園，有環湖步道、共融式遊具與寵物友善區域。湖畔景色優美，適合散步、遛狗與親子遊玩。",
    facilities: ["環湖步道", "共融式遊具", "寵物活動區", "涼亭", "釣魚區", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=碧湖公園台北",
    reviews: [
      { id: "r020", author: "內湖小陳", rating: 4, comment: "環湖步道很舒服，共融遊具也不錯，帶狗狗來散步很方便。", date: "2025-07-01" },
    ],
  },
  {
    id: "p014",
    name: "朝陽公園",
    city: "台北市",
    district: "大同區",
    address: "台北市大同區朝陽里",
    categories: ["slide", "walk"],
    funRating: 3,
    reviewCount: 10,
    description: "大同區的社區型公園，有溜滑梯、盪鞦韆等基本遊具，適合附近居民帶幼兒來玩耍。",
    facilities: ["溜滑梯", "盪鞦韆", "開放空間", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=朝陽公園台北大同",
    reviews: [
      { id: "r021", author: "大同居民", rating: 3, comment: "小型社區公園，遊具基本但夠用，適合帶小小孩來。", date: "2025-06-10" },
    ],
  },
  {
    id: "p015",
    name: "員山公園共融遊戲場",
    city: "宜蘭縣",
    district: "員山鄉",
    address: "宜蘭縣員山鄉員山路",
    categories: ["inclusive", "slide", "walk"],
    funRating: 5,
    reviewCount: 20,
    description: "宜蘭知名的共融式遊戲場，有大型攀爬設施、無障礙溜滑梯、沙坑與水遊戲區。結合自然地形設計，是宜蘭親子遊的必訪景點。",
    facilities: ["共融式遊具", "無障礙溜滑梯", "攀爬設施", "沙坑", "水遊戲區", "步道", "無障礙設施", "停車場", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=員山公園宜蘭",
    reviews: [
      { id: "r022", author: "宜蘭遊客", rating: 5, comment: "共融遊具超棒！水遊戲區夏天太讚了，從台北來一趟很值得。", date: "2025-07-10" },
      { id: "r023", author: "在地媽媽", rating: 5, comment: "宜蘭最好的親子公園，設施很新很安全，停車也方便。", date: "2025-06-18" },
    ],
  },
  {
    id: "p016",
    name: "花博公園美術園區",
    city: "台北市",
    district: "中山區",
    address: "台北市中山區民族東路1號",
    categories: ["walk", "bike", "inclusive"],
    funRating: 4,
    reviewCount: 23,
    description: "花博遺址改建的公園，有廣闊的花園、步道與共融式遊具。結合美術館與圓山捷運站，交通便利，適合親子半日遊。",
    facilities: ["花園", "步道", "共融式遊具", "自行車道", "花海區", "公共廁所", "停車場"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=花博公園美術園區",
    reviews: [
      { id: "r024", author: "花博粉絲", rating: 4, comment: "花海很漂亮，共融遊具也不錯，捷運站旁交通超方便。", date: "2025-06-28" },
    ],
  },
  {
    id: "p017",
    name: "中港公園",
    city: "新北市",
    district: "三重區",
    address: "新北市三重區中港南街",
    categories: ["slide", "pet", "walk"],
    funRating: 3,
    reviewCount: 11,
    description: "三重區的社區公園，有溜滑梯與寵物活動區，適合附近居民日常散步與遛狗。",
    facilities: ["溜滑梯", "寵物活動區", "步道", "涼亭", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=中港公園三重",
    reviews: [
      { id: "r025", author: "三重居民", rating: 3, comment: "社區小公園，基本設施都有，帶狗狗散步很方便。", date: "2025-06-05" },
    ],
  },
  {
    id: "p018",
    name: "文心森林公園",
    city: "台中市",
    district: "南屯區",
    address: "台中市南屯區文心路一段",
    categories: ["walk", "bike", "inclusive"],
    funRating: 4,
    reviewCount: 29,
    description: "台中市的大型森林公園，有環園步道、自行車道與共融式遊戲場。園內有圓滿戶外劇場，常有藝文活動，是台中市民休閒好去處。",
    facilities: ["環園步道", "自行車道", "共融式遊具", "戶外劇場", "大草坪", "公共廁所", "停車場"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=文心森林公園台中",
    reviews: [
      { id: "r026", author: "台中阿傑", rating: 4, comment: "很大很好逛，共融遊具小孩很喜歡，晚上有時有表演可以看。", date: "2025-07-04" },
    ],
  },
  {
    id: "p019",
    name: "安平湖濱水鳥公園",
    city: "台南市",
    district: "安平區",
    address: "台南市安平區湖內街",
    categories: ["walk", "pet", "bike"],
    funRating: 4,
    reviewCount: 16,
    description: "安平區的水岸公園，有環湖步道、寵物活動區與自行車道。可觀賞水鳥生態，夕陽時分景色優美，適合散步與遛狗。",
    facilities: ["環湖步道", "寵物活動區", "自行車道", "觀鳥區", "涼亭", "公共廁所"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=安平湖濱水鳥公園",
    reviews: [
      { id: "r027", author: "安平居民", rating: 4, comment: "傍晚來散步看夕陽超棒，帶狗狗來也很適合。", date: "2025-06-22" },
    ],
  },
  {
    id: "p020",
    name: "大鹏灣濱海公園",
    city: "屏東縣",
    district: "東港鎮",
    address: "屏東縣東港鎮大鵬灣",
    categories: ["walk", "bike", "pet"],
    funRating: 5,
    reviewCount: 31,
    description: "大鵬灣國家風景區內的濱海公園，有環灣自行車道、步道與寵物友善區域。可欣賞潟湖生態與跨海大橋，是屏東最熱門的戶外景點。",
    facilities: ["環灣自行車道", "步道", "寵物活動區", "觀景台", "潟湖生態區", "停車場", "公共廁所", "餐飲區"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=大鵬灣濱海公園屏東",
    reviews: [
      { id: "r028", author: "屏東遊客", rating: 5, comment: "環灣騎車超讚！風景很美，帶狗狗來也很開心。", date: "2025-07-09" },
      { id: "r029", author: "單車族", rating: 5, comment: "自行車道很長很平坦，沿途風景超漂亮，推薦！", date: "2025-06-15" },
    ],
  },
];
