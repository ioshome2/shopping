import {
  getWelfareList,
  doWelfareAction,
  getSignInfo,
  signIn,
  getGoodsJindou,
  getJinguoDayWork,
  harvestJinguo,
  signJinguo,
  getFanpaiInfo,
  fanpai,
  getLotteryInfo,
  getLottery,
  getHealthInsuredInfo,
  getHealthInsured,
  getGiftInfo,
  getGift
} from "./jinrong";
import { timer, timerCondition, log, logReq, delay } from "../utils/tools";

export async function doWelfareActions() {
  log("检查参加活动领金豆");
  var {
    data: { welActList }
  } = await getWelfareList();
  welActList.forEach(item => {
    let count = item.rewardTimesDayLimit - item.alreadyRewardTimesDay;
    if (count > 0) {
      log(`参加活动 - ${item.actName}`);
      timer(3000 + Math.random() * 10000, count)(() =>
        logReq(`活动 - ${item.actName}`, doWelfareAction(item.actType))
      );
    }
  });
}

export async function doSign() {
  log("检查金融签到");
  var { resBusiCode, resBusiData } = await getSignInfo();
  if (resBusiCode === 0 && !resBusiData.isFlag) {
    await logReq("执行金融签到", signIn);
  }
}

export const doAdJindou = () =>
  timerCondition(3000, (data: any) => {
    console.log(data);
    return data.canGetGb;
  })(getGoodsJindou);

export async function doJinguo() {
  log("检查金果");
  timer(1000 * 60 * 10)(() => logReq("开始收获金果", harvestJinguo));
  handler();
  var [signData, shareData] = await getJinguoDayWork();
  if (signData.workStatus === 0) {
    await logReq("领取金果签到奖励", signJinguo(signData.workType, 2));
  }
  console.log("金果分享状态", shareData.workStatus);
  if (shareData.workStatus === 0) {
    await logReq("金果分享", signJinguo(shareData.workType, 1));
    await delay(3000);
    shareData.workStatus = 1;
  }
  if (shareData.workStatus === 1) {
    await logReq("领取金果分享奖励", signJinguo(shareData.workType, 2));
  }
  function handler() {
    var now = new Date();
    var h = now.getHours();
    var arr = [7, 11, 18];
    var toh: any;
    for (let i of arr) {
      if (h < i) {
        toh = i;
        break;
      }
    }
    if (toh) {
      setTimeout(() => {
        logReq("金果签到", signJinguo(signData.workType, 2));
        handler();
      }, new Date(now.getFullYear(), now.getMonth(), now.getDate(), toh).getTime() - now.getTime());
    }
  }
}

export async function doFanpai() {
  log("检查翻牌");
  var { data, code } = await getFanpaiInfo();
  if (code === 1) {
    if (data.isAllowSignin !== 0) {
      return logReq("执行翻牌", fanpai);
    }
  }
}

export async function doLottery() {
  log("检查免费抽奖");
  var { lotteryCoins } = await getLotteryInfo();
  if (lotteryCoins === 0) {
    return logReq("执行免费抽奖", getLottery);
  }
}

export async function doHealthInsured() {
  log("检查健康金");
  var { success, resultData, resultMsg } = await getHealthInsuredInfo();
  if (success) {
    if (Number(resultData.unSumInsured) > 0) {
      return logReq("领取健康金", getHealthInsured);
    }
  }
}

export async function doGift() {
  log("检查金融会员开礼盒");
  var { success, data } = await getGiftInfo();
  if (success) {
    for (let i = 0; i < data.freeTimes; i++) {
      return logReq("领取金融会员礼盒", getGift);
    }
  }
}

export async function doAll() {
  return Promise.all([
    doSign(),
    doJinguo(),
    doWelfareActions(),
    doFanpai(),
    doLottery(),
    doHealthInsured(),
    doAdJindou()
  ]);
}
