
// 出現する9つの国旗
const flagSequence = [
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
  [1,2,3,4,5,6,7,8,9],
];

const minute_question = "何分でしたか？";
const second_question = "何秒でしたか？";

const question1 = "今、どれくらい国旗を覚えれていますか？";
const question2 = "今、どれくらい集中できてますか？";
const question3 = "今、タスク以外のことをどれくらい考えてましたか？";
const question4 = "今、どれくらい余裕がありますか？";
const question5 = "今、どれくらい眠いですか？";



const timeModeList = [
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




export { flagSequence, timeModeList_real , timeModeList };