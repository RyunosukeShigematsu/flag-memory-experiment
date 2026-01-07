
// 出現する9つの国旗
// const flagSequenc = [
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
//   [1,2,3,4,5,6,7,8,9],
// ];

// timeLine.js
const flagSequence = [
  {
    ids:      [1,2,3,4,5,6,7,8,9],   // 覚える9枚（固定）
    bottomL:  [1,2,3],               // アンサー下段「左3枚（name）」固定
    bottomR:  [1,8,9],               // アンサー下段「右3枚（flag）」固定
  },
];

const flagSequence_A = [
  {
    ids:      [2,1,3,4,5,6,7,8,9],   // 覚える9枚（固定）
    bottomL:  [2,1,3],               // アンサー下段「左3枚（name）」固定
    bottomR:  [2,8,9],               // アンサー下段「右3枚（flag）」固定
  },
    {
    ids:      [2,1,3,4,5,6,7,8,9],   // 覚える9枚（固定）
    bottomL:  [2,1,3],               // アンサー下段「左3枚（name）」固定
    bottomR:  [2,8,9],               // アンサー下段「右3枚（flag）」固定
  },
];

const flagSequence_B = [
  {
    ids:      [3,2,1,4,5,6,7,8,9],   // 覚える9枚（固定）
    bottomL:  [3,2,1],               // アンサー下段「左3枚（name）」固定
    bottomR:  [3,8,9],               // アンサー下段「右3枚（flag）」固定
  },
    {
    ids:      [2,1,3,4,5,6,7,8,9],   // 覚える9枚（固定）
    bottomL:  [2,1,3],               // アンサー下段「左3枚（name）」固定
    bottomR:  [2,8,9],               // アンサー下段「右3枚（flag）」固定
  },
];

const minute_question = "何分でしたか？";
const second_question = "何秒でしたか？";

const question1 = "どれくらい国旗を覚えれていますか？";
const question2 = "どれくらい集中できてますか？";
const question3 = "タスク以外のことをどれくらい考えてましたか？";
const question4 = "どれくらい余裕がありますか？";
const question5 = "どれくらい眠いですか？";

const practiceTimeModeList = [
  { time: "10:00:12", mode: 1, question: question2 },
  { time: "10:01:47", mode: 1, question: question1 },
  { time: "10:03:05", mode: 1, question: question4 },
  { time: "10:04:58", mode: 1, question: question3 },
  { time: "10:06:21", mode: 1, question: question5 },

  { time: "10:08:02", mode: 1, question: question1 },
  { time: "10:09:14", mode: 1, question: question2 },
  { time: "10:11:03", mode: 1, question: question5 },
  { time: "10:12:49", mode: 1, question: question4 },
  { time: "10:14:10", mode: 1, question: question3 },

  { time: "10:16:42", mode: 1, question: question2 },
  { time: "10:18:01", mode: 1, question: question4 },
  { time: "10:19:37", mode: 1, question: question1 },
  { time: "10:21:55", mode: 1, question: question5 },
  { time: "10:23:08", mode: 1, question: question3 },

  { time: "10:25:46", mode: 1, question: question4 },
  { time: "10:27:12", mode: 1, question: question2 },
  { time: "10:29:04", mode: 1, question: question3 },
  { time: "10:30:51", mode: 1, question: question1 },
  { time: "10:32:40", mode: 1, question: question5 },

];


const systemCheckTimeModeList = [
  { time: "13:14:23", mode: 1, question: "13 たす 24 わ？" },   
  { time: "13:59:09", mode: 1, question: "78 たす 11 わ？" },
  { time: "15:39:11", mode: 1, question: "39 たす 41 わ？" }
];

const timeModeList_A = [
  // 1-5
  { time: "09:12:47", mode: 1, question: question2 },
  { time: "14:58:03", mode: 3, question: "27 たす 36 わ？" },
  { time: "11:07:52", mode: 1, question: minute_question },
  { time: "16:21:09", mode: 2, question: question4 },
  { time: "10:39:58", mode: 1, question: "54 ひく 27 わ？" },
  // 6-10
  { time: "13:04:31", mode: 3, question: question1 },
  { time: "15:46:14", mode: 1, question: second_question },
  { time: "08:53:26", mode: 2, question: "48 たす 29 わ？" },
  { time: "17:19:42", mode: 1, question: question3 },
  { time: "12:35:07", mode: 2, question: question5 },
  // 11-15
  { time: "14:11:54", mode: 3, question: "73 ひく 18 わ？" },
  { time: "09:48:19", mode: 2, question: minute_question },
  { time: "16:02:33", mode: 1, question: question2 },
  { time: "11:56:41", mode: 2, question: "63 たす 18 わ？" },
  { time: "10:24:58", mode: 3, question: question4 },
  // 16-20
  { time: "18:07:13", mode: 2, question: second_question },
  { time: "13:33:40", mode: 1, question: "34 たす 45 わ？" },
  { time: "09:05:36", mode: 2, question: question3 },
  { time: "12:49:11", mode: 1, question: question1 },
  { time: "16:44:27", mode: 3, question: "62 ひく 35 わ？" },
  // 21-25
  { time: "10:17:08", mode: 1, question: question5 },
  { time: "14:26:59", mode: 3, question: second_question },
  { time: "11:28:04", mode: 2, question: "41 たす 38 わ？" },
  { time: "17:02:45", mode: 1, question: question2 },
  { time: "13:57:16", mode: 3, question: question4 },
  // 26-30
  { time: "09:33:21", mode: 2, question: question3 },
  { time: "15:18:50", mode: 1, question: "52 たす 27 わ？" },
  { time: "10:52:32", mode: 3, question: minute_question },
  { time: "12:08:57", mode: 2, question: "28 たす 47 わ？" },
  { time: "16:11:29", mode: 1, question: question1 },
];


const timeModeList_B = [
  // 1-5
  { time: "10:14:06", mode: 2, question: "39 たす 41 わ？" },
  { time: "15:02:18", mode: 1, question: question4 },
  { time: "09:41:53", mode: 1, question: second_question },
  { time: "13:27:09", mode: 3, question: "78 たす 11 わ？" },
  { time: "11:58:44", mode: 2, question: question2 },
  // 6-10
  { time: "16:08:31", mode: 2, question: minute_question },
  { time: "08:56:20", mode: 1, question: "32 ひく 14 わ？" },
  { time: "14:39:07", mode: 3, question: question1 },
  { time: "10:23:55", mode: 1, question: question3 },
  { time: "12:46:12", mode: 2, question: "12 たす 43 わ？" },
  // 11-15
  { time: "17:11:06", mode: 1, question: minute_question },
  { time: "09:06:49", mode: 3, question: question5 },
  { time: "15:34:28", mode: 1, question: "56 ひく 23 わ？" },
  { time: "11:12:35", mode: 2, question: question4 },
  { time: "13:49:57", mode: 3, question: minute_question },
  // 16-20
  { time: "16:22:10", mode: 3, question: "44 たす 35 わ？" },
  { time: "10:57:03", mode: 1, question: question2 },
  { time: "14:05:41", mode: 2, question: second_question },
  { time: "09:29:16", mode: 2, question: "67 ひく 28 わ？" },
  { time: "12:18:59", mode: 3, question: question1 },
  // 21-25
  { time: "17:36:22", mode: 1, question: question3 },
  { time: "11:03:14", mode: 3, question: second_question },
  { time: "15:45:08", mode: 2, question: question5 },
  { time: "08:39:50", mode: 1, question: "61 たす 19 わ？" },
  { time: "13:10:27", mode: 3, question: question4 },
  // 26-30
  { time: "10:31:33", mode: 2, question: question1 },
  { time: "16:54:45", mode: 1, question: question2 },
  { time: "12:07:36", mode: 3, question: "29 たす 58 わ？" },
  { time: "14:44:19", mode: 1, question: question3 },
  { time: "09:52:08", mode: 2, question: question5 },
];


const timeModeList_1 = [
  { time: "13:14:23", mode: 1, question: "13 たす 24 わ？" },
  { time: "13:20:51", mode: 2, question: minute_question },
  { time: "13:30:42", mode: 1, question: "48 たす 17 わ？" },
  { time: "13:34:48", mode: 1, question: question1},
  { time: "13:40:55", mode: 1, question: "41 たす 52 わ？" },
  { time: "13:50:13", mode: 1, question: "65 たす 14 わ？" },
  { time: "13:59:09", mode: 1, question: "78 たす 11 わ？" },
  { time: "14:02:12", mode: 1, question: "27 たす 39 わ？" },
  { time: "14:14:43", mode: 1, question: "56 たす 28 わ？" },
  { time: "14:20:58", mode: 1, question: "47 たす 33 わ？" },
  { time: "14:28:31", mode: 1, question: "91 たす 12 わ？" },
  { time: "14:34:03", mode: 1, question: "34 たす 44 わ？" },
  { time: "14:44:39", mode: 1, question: "58 たす 26 わ？" },
  { time: "14:51:02", mode: 1, question: "69 たす 21 わ？" },
  { time: "14:56:46", mode: 1, question: "83 たす 14 わ？" },
  { time: "15:04:55", mode: 1, question: "72 たす 25 わ？" },
  { time: "15:09:12", mode: 1, question: "64 たす 30 わ？" },
  { time: "15:22:40", mode: 1, question: "49 たす 48 わ？" },
  { time: "15:33:58", mode: 1, question: "57 たす 22 わ？" },
  { time: "15:39:11", mode: 1, question: "39 たす 41 わ？" }
];




const timeModeList_real = [
  { time: "13:14:23", mode: 1 },
  { time: "13:20:51", mode: 1 },
  { time: "13:30:42", mode: 3 },
  { time: "13:34:48", mode: 2 },
  { time: "13:40:55", mode: 1 },
  { time: "13:50:13", mode: 3 },
  { time: "13:59:09", mode: 2 },
  { time: "14:02:12", mode: 3 },
  { time: "14:14:43", mode: 1 },
  { time: "14:20:58", mode: 3 },
  { time: "14:28:31", mode: 2 },
  { time: "14:34:03", mode: 3 },
  { time: "14:44:39", mode: 1 },
  { time: "14:51:02", mode: 3 },
  { time: "14:56:46", mode: 2 },
  { time: "15:04:55", mode: 3 },
  { time: "15:09:12", mode: 1 },
  { time: "15:22:40", mode: 3 },
  { time: "15:33:58", mode: 2 },
  { time: "15:39:11", mode: 3 },
];




export { flagSequence, flagSequence_A, flagSequence_B, practiceTimeModeList, systemCheckTimeModeList, timeModeList_real, timeModeList_A, timeModeList_B };