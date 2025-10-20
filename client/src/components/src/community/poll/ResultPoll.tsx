"use client";
import styles from "./styles/AddPoll.module.scss";

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {GoPeople} from "react-icons/go";
import {saveAs} from "file-saver";
import ExcelJS from "exceljs";

import {usePollContext} from "@/context/PollContext";
import {useUserContext} from "@/context/UserContext";

import {requestPost} from "@/util/api/api-service";

import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import Divider from "@/components/common/segment/Divider";
import BarChartHorizontal from "@/components/common/data-display/BarChartHorizontal";
import PieChart from "@/components/common/data-display/PieChart";
import Grid from "@/components/common/data-display/Grid";
import PollInfo from "./PollInfo";

import AlertService from "@/services/alert.service";
import {getPollResultColumns} from "./etc/poll-result-columns";
import {
  ResponseStatus,
  ResponseTypeEnum,
  resultHeaders,
} from "@/types/poll.type";

type GridRow = {
  respondent: string;
  empNo: string;
  korNm: string;
  deptNm: string;
  answer: string;
};

export default function ResultPoll() {
  const params = useParams();
  const pollIdx = Number(params.pollIdx);

  const {matchEmpNoToRank, matchDeptCdToDeptNm} = useUserContext();
  const {state, dispatch} = usePollContext();
  const {poll, mode} = state;
  const {questions, respondents} = poll || {};

  const [pollResult, setPollResult] = useState<
    Record<number, {id: string; name: string; value: number}[]> | undefined
  >(undefined);

  const isAnonymous = poll?.isAnonymous;

  async function getPollDetail() {
    const res = await requestPost("/poll/getPollDetail", {
      pollIdx: pollIdx,
      isAnonymous: isAnonymous, // 익명 응답 여부
    });
    if (res.statusCode === 200) {
      console.log("설문 응답 상세 조회 결과:", res);
      dispatch({type: "SET_POLL", payload: res.data});
    }
  }

  async function getPollResult() {
    const res = await requestPost("/poll/getPollResult", {
      pollIdx: pollIdx,
      isAnonymous: isAnonymous, // 익명 응답 여부
    });
    if (res.statusCode === 200) {
      // console.log("설문 결과 통계:", res.data);
      const grouped = groupPollResultByQuestion(res.data);
      setPollResult(grouped);
    }
  }

  function groupPollResultByQuestion(resultData: any[]) {
    const grouped: Record<number, {id: string; name: string; value: number}[]> =
      {};

    for (const row of resultData) {
      const {questionIdx, answer, value} = row;
      const answerStr = String(answer);

      if (!grouped[questionIdx]) {
        grouped[questionIdx] = [];
      }
      const matchedSelection = questions
        ?.find((q) => q.questionIdx === questionIdx)
        ?.selections?.find((s) => String(s.selectionIdx) === answerStr);

      grouped[questionIdx].push({
        id: answerStr,
        name: matchedSelection
          ? `(${matchedSelection.order}) ${matchedSelection.selection}`
          : answerStr,
        value: Number(value),
      });
    }

    return grouped;
  }

  function getGridDataByQuestion(
    question: {responses?: any[]},
    respondents?: any[],
    isAnonymous?: boolean,
  ): GridRow[] {
    return (question.responses ?? []).map((res, idx) => {
      if (isAnonymous) {
        return {
          respondent: `익명응답자 ${idx + 1}`,
          empNo: "-",
          korNm: "-",
          deptNm: "-",
          answer: res.answer,
        };
      }

      const user = respondents?.find(
        (r) => r.respondentIdx === res.respondentIdx,
      );

      return {
        respondent: user?.userId ?? "-",
        empNo: user?.empNo ?? "-",
        korNm: user ? matchEmpNoToRank(user.empNo) : "-",
        deptNm: user ? matchDeptCdToDeptNm(user.deptCd) : "-",
        answer: res.answer,
      };
    });
  }

  useEffect(() => {
    if (poll?.questions?.length) {
      getPollResult();
    }
  }, [poll]);
  useEffect(() => {
    getPollDetail();
  }, [pollIdx]);

  async function downloadExcel() {
    if (!questions?.length) return;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("설문 응답");

    // 헤더
    const headerRow = sheet.addRow(resultHeaders);
    headerRow.height = 30.75;

    // 데이터
    questions.forEach((q) => {
      const rows = getGridDataByQuestion(q, respondents, isAnonymous);
      rows.forEach((row) => {
        sheet.addRow([
          q.order,
          q.question,
          row.empNo,
          row.respondent, // userId
          row.korNm,
          row.deptNm,
          row.answer,
        ]);
      });
      // 질문마다 공백 줄 추가
      sheet.addRow([]);
    });

    // 셀 너비 자동 조정
    sheet.columns?.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({includeEmpty: true}, (cell) => {
        maxLength = Math.max(maxLength, cell.value?.toString()?.length ?? 0);
      });
      column.width = maxLength + 2;
    });

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `설문_${poll.title ?? "설문"}_${poll.createdAt}.xlsx`);
    AlertService.success("설문 결과를 다운로드하였습니다.");
  }

  // 응답자 통계 관련
  const respondentCompleted = respondents?.filter(
    (r) => r.responseStatus === ResponseStatus.COMPLETED,
  );

  return (
    <div>
      <PollInfo />
      <div className={styles.questionsWrapper}>
        {questions
          ?.slice() // 원본 배열 변형 방지
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // sort(compareFunction)
          .map((q) => {
            const isCheckRadio =
              q.responseType === ResponseTypeEnum.CHECK ||
              q.responseType === ResponseTypeEnum.RADIO;

            return (
              <div
                key={`${q.questionIdx}-${q.order}`}
                className={styles.questionNodes}
              >
                <div className={clsx("row", styles.questionOptions)}>
                  <div>
                    {q?.isRequired && (
                      <span className={styles.required}>*</span>
                    )}
                    {q?.order}. {q?.question}
                    {q?.isRequired && (
                      <span className={styles.required}>(필수 응답)</span>
                    )}
                  </div>
                  <div className={styles.targets}>
                    <GoPeople />
                    {isAnonymous
                      ? poll?.completedRespondents
                      : (() => {
                          const partOfRespondentsArr =
                            respondentCompleted?.filter((c) =>
                              q.responses?.some(
                                (r) => r.respondentIdx === c.respondentIdx,
                              ),
                            );
                          const uniquePartOfRespondentsArr = Array.from(
                            new Map(
                              partOfRespondentsArr?.map((r) => [
                                r.respondentIdx,
                                r,
                              ]),
                            ).values(),
                          );
                          return (
                            <span className={styles.respondents}>
                              {uniquePartOfRespondentsArr.length}
                            </span>
                          );
                        })()}
                    <span>
                      /
                      {isAnonymous
                        ? poll?.totalRespondents
                        : respondentCompleted?.length}
                    </span>
                  </div>
                </div>

                {/* 질문 결과에 따른 차트 */}
                <div className={clsx(styles.charts, "row")}>
                  {isCheckRadio ? (
                    <>
                      <BarChartHorizontal
                        data={
                          pollResult && q.questionIdx !== undefined
                            ? pollResult[q.questionIdx]
                            : []
                        }
                      />
                      <PieChart
                        data={
                          pollResult && q.questionIdx !== undefined
                            ? pollResult[q.questionIdx]
                            : []
                        }
                      />
                    </>
                  ) : (
                    <Grid
                      data={getGridDataByQuestion(q, respondents)}
                      columns={getPollResultColumns()}
                    />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <Divider type="none"></Divider>

      <CommonButtonGroup
        usedButtons={{
          btnList: true,
          btnDownload: true,
        }}
        onDownload={downloadExcel}
      ></CommonButtonGroup>
    </div>
  );
}
