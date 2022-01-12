import fetch from "node-fetch";
import "reflect-metadata";
import { plainToClass } from "class-transformer";

type Menu = { MENU_STR: string; MENU_CODE: string };

type Result = {
  RESULT_CODE: string;
  RESULT_MSG: string;
  MENU: Menu[];
};

class Response {
  RESULT: Result = {
    RESULT_CODE: "1",
    RESULT_MSG: "",
    MENU: [],
  };
}

const URL_HEAD =
  "https://www.car365.go.kr/web/program/usedcarpriceData.do?machineCode=1&menuType=";
const URL_BODY = "&menuNation=1&menuEntrps=";
const URL_TAIL = "&menuReprsnt=";
const URL_TAIL2 = "&menuModel=&menuPrye=&searchStr=";

const url = (
  menuType: number,
  menuEntrps?: string,
  menuReprsnt?: string
): string => {
  return [
    URL_HEAD,
    menuType,
    URL_BODY,
    menuEntrps,
    URL_TAIL,
    menuReprsnt,
    URL_TAIL2,
  ]
    .filter((value) => value !== undefined)
    .join("");
};

const getResult = async (
  menuType: number,
  menuEntrps?: string,
  menuReprsnt?: string
): Promise<Response> => {
  const requestUrl = url(menuType, menuEntrps, menuReprsnt);
  const response = await fetch(requestUrl, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language":
        "ko,en-US;q=0.9,en;q=0.8,fr;q=0.7,hu;q=0.6,es;q=0.5,ru;q=0.4,th;q=0.3,ja;q=0.2,zh;q=0.1,zh-CN;q=0.1,zh-TW;q=0.1,be;q=0.1,mk;q=0.1,pl;q=0.1,it;q=0.1",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua":
        '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: "https://www.car365.go.kr/web/contents/usedcar_price.do",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
  });
  const json = await response.json();
  return plainToClass(Response, json);
};

async function run() {
  const result = await getResult(1);

  const manufacturerResult = await Promise.all(
    result.RESULT.MENU.map((menu) => getResult(2, menu.MENU_CODE))
  );

  const modelResult = await Promise.all(
    manufacturerResult.map((result) => {
      result.RESULT.MENU.map((menu) => {
        getResult(3, menu.MENU_CODE);
      });
    })
  );

  console.log(modelResult);
}

run();

export default run;
