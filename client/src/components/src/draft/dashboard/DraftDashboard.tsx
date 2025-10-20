"use client";
import style from "../styles/DraftDashboard.module.scss";
import Card from "@/components/common/layout/Card";
import SpaceInCard from "@/components/common/layout/SpaceInCard";
import SubTitle from "@/components/common/segment/SubTitle";
import { GoChecklist } from "react-icons/go";
import { TbReportSearch } from "react-icons/tb";
import StatusItem from "@/components/common/segment/StatusItem";
import CountingItem from "@/components/common/segment/CountingItem";
export default function DraftDashboard() {
  return (
    <div className={style.container}>
      <div className={style.containerLeft}>
        <Card>
          <SpaceInCard>
            <SubTitle icon={<GoChecklist />}>
              <>결재문서 현황</>
            </SubTitle>
            <div className={style.summaryWrap}>
              <CountingItem title="내 승인 대기" count={8} />
              <CountingItem title="진행 중" count={23} />
            </div>
            <div className={style.summaryWrap}>
              <CountingItem title="예정" count={12} />
              <CountingItem title="완료" subTitle="(최근 3일)" count={78} />
            </div>
            <div className={style.summaryWrap}>
              <CountingItem title="읽지않은 참조" count={64} />
            </div>
          </SpaceInCard>
        </Card>

        <div className={style.containerHalf}>
          <Card>
            <SpaceInCard>
              <SubTitle icon={<GoChecklist />}>
                <>결재 대기 / 예정</>
              </SubTitle>
              <StatusItem
                statusText="대기"
                name="김영희"
                date="2025-00-00(수)"
                subject="4월 19일 / 생일반차"
              />
              <StatusItem
                statusText="대기"
                name="김영희"
                date="2025-00-00(수)"
                subject="4월 19일 / 생일반차"
              />
              <StatusItem
                statusText="예정"
                name="김아무개"
                date="2025-00-00(수)"
                subject="본사 커피머신 구매"
                isUrgent={true}
              />
            </SpaceInCard>
          </Card>
        </div>
        <div className={style.containerHalf}>
          <Card>
            <SpaceInCard>
              <SubTitle icon={<TbReportSearch />}>
                <>참조</>
              </SubTitle>
              <StatusItem
                statusText="참조"
                name="홍길동"
                date="2025-00-00(수)"
                subject="25년 2월 생일자 기프티콘 발송"
              />
              <StatusItem
                statusText="참조"
                name="김아무개"
                date="2025-00-00(수)"
                subject="경풍빌딩 2층 복합기 렌탈"
              />
            </SpaceInCard>
          </Card>
        </div>
      </div>

      <div className={style.containerRight}>
        <Card>
          <SpaceInCard>
            <SubTitle icon={<GoChecklist />}>
              <>내 기안 현황</>
            </SubTitle>
            <div className={style.myDraftWrap}>
              <div className={style.summaryWrap}>
                <CountingItem darkMode={true} title="대기" count={1} />
              </div>
              <div className={style.summaryWrap}>
                <CountingItem darkMode={true} title="진행 중" count={2} />
              </div>
              <div className={style.summaryWrap}>
                <CountingItem
                  darkMode={true}
                  title="완료"
                  subTitle="(최근 3일)"
                  count={7}
                />
              </div>
            </div>
            {/* <div style={{ height: "51px" }}></div> */}
          </SpaceInCard>
        </Card>
        <Card>
          <SpaceInCard>
            <SubTitle icon={<GoChecklist />}>
              <>최근 기안 현황</>
            </SubTitle>
            <StatusItem
              darkMode={true}
              statusText="대기"
              name="김영희"
              date="2025-00-00(수)"
              subject="4월 19일 / 생일반차"
            />
            <StatusItem
              darkMode={true}
              statusText="진행"
              name="김영희"
              date="2025-00-00(수)"
              subject="3월 7일 / 연차"
            />
            <StatusItem
              darkMode={true}
              statusText="완료"
              name="김영희"
              date="2025-00-00(수)"
              subject="설연휴 연차"
            />
          </SpaceInCard>
        </Card>
      </div>
    </div>
  );
}
