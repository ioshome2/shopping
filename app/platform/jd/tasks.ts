/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:10:22
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-07-01 09:10:22
 */
import { doAll as doJdAll } from "./jd-util";
import { doAll as doJrAll } from "./jr-util";
import { getSignJRInfo, getSignAwardJR, onInitJingrong } from "./jingrong";
import bus_global from "../../common/bus";
import { onInitJingdong } from "./jingdong";

export function bootstrapJingdongTasks() {
  return Promise.all([doJdAll(), doJrAll()])
    .then(() => getSignJRInfo())
    .then(({ isGet }) => {
      if (!isGet) {
        getSignAwardJR();
      }
    });
}

bus_global.on("cookie:init", () => {
  Promise.all([onInitJingdong(), onInitJingrong()]);
});
