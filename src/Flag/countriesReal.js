// 練習用の架空国データの読み込み
import japanFlag from "./RealFlags/Japan.png";
import usaFlag from "./RealFlags/UnitedStates.png";
import ukFlag from "./RealFlags/UnitedKingdom.png";
import franceFlag from "./RealFlags/France.png";
import germanyFlag from "./RealFlags/Germany.png";
import italyFlag from "./RealFlags/Italy.png";
import chinaFlag from "./RealFlags/China.png";
import koreaFlag from "./RealFlags/SouthKorea.png";
import canadaFlag from "./RealFlags/Canada.png";

import spainFlag from "./RealFlags/Spain.png";
import netherlandsFlag from "./RealFlags/Netherlands.png";
import belgiumFlag from "./RealFlags/Belgium.png";
import switzerlandFlag from "./RealFlags/Switzerland.png";
import swedenFlag from "./RealFlags/Sweden.png";
import norwayFlag from "./RealFlags/Norway.png";
import australiaFlag from "./RealFlags/Australia.png";
import brazilFlag from "./RealFlags/Brazil.png";
import mexicoFlag from "./RealFlags/Mexico.png";

import portugalFlag from "./RealFlags/Portugal.png";
import greeceFlag from "./RealFlags/Greece.png";
import finlandFlag from "./RealFlags/Finland.png";
import polandFlag from "./RealFlags/Poland.png";
import argentinaFlag from "./RealFlags/Argentina.png";
import chileFlag from "./RealFlags/Chile.png";
import thailandFlag from "./RealFlags/Thailand.png";
import turkeyFlag from "./RealFlags/Turkey.png";
import southAfricaFlag from "./RealFlags/SouthAfrica.png";




// 練習用の架空国リスト
const PRACTICE_COUNTRIES = [
  // --- セットA（超定番） ---
  { id: 1, nameJa: "日本", flag: japanFlag },        // 🇯🇵
  { id: 2, nameJa: "アメリカ", flag: usaFlag },          // 🇺🇸
  { id: 3, nameJa: "イギリス", flag: ukFlag },           // 🇬🇧
  { id: 4, nameJa: "フランス", flag: franceFlag },       // 🇫🇷
  { id: 5, nameJa: "ドイツ", flag: germanyFlag },      // 🇩🇪
  { id: 6, nameJa: "イタリア", flag: italyFlag },        // 🇮🇹
  { id: 7, nameJa: "中国", flag: chinaFlag },        // 🇨🇳
  { id: 8, nameJa: "韓国", flag: koreaFlag },        // 🇰🇷
  { id: 9, nameJa: "カナダ", flag: canadaFlag },       // 🇨🇦

  // --- セットB（少し迷う） ---
  { id: 10, nameJa: "スペイン", flag: spainFlag },        // 🇪🇸
  { id: 11, nameJa: "オランダ", flag: netherlandsFlag },  // 🇳🇱
  { id: 12, nameJa: "ベルギー", flag: belgiumFlag },      // 🇧🇪
  { id: 13, nameJa: "スイス", flag: switzerlandFlag },  // 🇨🇭
  { id: 14, nameJa: "スウェーデン", flag: swedenFlag },       // 🇸🇪
  { id: 15, nameJa: "ノルウェー", flag: norwayFlag },       // 🇳🇴
  { id: 16, nameJa: "オーストラリア", flag: australiaFlag }, // 🇦🇺
  { id: 17, nameJa: "ブラジル", flag: brazilFlag },       // 🇧🇷
  { id: 18, nameJa: "メキシコ", flag: mexicoFlag },       // 🇲🇽

  // --- セットC（見覚えあるが即答しにくい） ---
  { id: 19, nameJa: "ポルトガル", flag: portugalFlag },     // 🇵🇹
  { id: 20, nameJa: "ギリシャ", flag: greeceFlag },       // 🇬🇷
  { id: 21, nameJa: "フィンランド", flag: finlandFlag },      // 🇫🇮
  { id: 22, nameJa: "ポーランド", flag: polandFlag },       // 🇵🇱
  { id: 23, nameJa: "アルゼンチン", flag: argentinaFlag },    // 🇦🇷
  { id: 24, nameJa: "チリ", flag: chileFlag },         // 🇨🇱
  { id: 25, nameJa: "タイ", flag: thailandFlag },      // 🇹🇭
  { id: 26, nameJa: "トルコ", flag: turkeyFlag },        // 🇹🇷
  { id: 27, nameJa: "南アフリカ", flag: southAfricaFlag },  // 🇿🇦
];

export default PRACTICE_COUNTRIES;
