"use client";
import {ChangeEvent, useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {PagedDataType} from "@/types/common.type";
import {
  ContactType,
  FavoriteContactTargetEnum,
  PersonalContactType,
} from "@/types/mail.type";
import {requestPost} from "@/util/api/api-service";
import {isNotEmpty} from "@/util/validators/check-empty";
import {useMailContext} from "@/context/MailContext";
import {saveLastUrl} from "@/util/common/last-url";

import styles from "./styles/ContactList.module.scss";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import useModal from "@/hooks/useModal";
import Pagination from "@/components/common/layout/Pagination";
import ContactListLine from "./ContactListLine";
import ContactHeaderBtnGroup from "./inner/ContactHeaderBtnGroup";
import ProfileCard from "@/components/common/company-related/ProfileCard";
import CheckBox from "@/components/common/form-properties/CheckBox";
import Modal from "@/components/common/layout/Modal";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

const ContactListHeader = ({
  selectionMode,
  onSelectAll,
  isAllSelected,
  hasPersonalContacts = false,
}: {
  selectionMode?: boolean;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  hasPersonalContacts?: boolean;
}) => (
  <div className={clsx(styles.lineWrapper, styles.headerRow)}>
    <div className={styles.check}>
      {selectionMode ? (
        <CheckBox
          componentType="orange"
          value={isAllSelected}
          onChange={onSelectAll}
        />
      ) : (
        "선택"
      )}
    </div>
    <div className={styles.isImportant}>즐겨찾기</div>
    <div className={styles.companyNm}>회사</div>
    <div className={styles.userId}>ID</div>
    <div className={styles.korNm}>이름</div>
    <div className={styles.email}>이메일</div>
    <div className={styles.deptNm}>부서</div>
    <div className={styles.mobile}>전화번호</div>
    <div className={styles.empNo}>사원번호</div>
    {hasPersonalContacts && <div className={styles.editBtn}>관리</div>}
  </div>
);

const searchCategory = [
  {label: "회사", value: "companyNm"},
  {label: "이름", value: "korNm"},
  {label: "이메일", value: "email"},
  {label: "부서", value: "deptNm"},
  {label: "전화번호", value: "mobile"},
  {label: "사원번호", value: "empNo"},
];

export default function ContactList({
  menuNodeMap,
  activeMenuId,
}: {
  menuNodeMap: Record<string, () => any>;
  activeMenuId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [paginatedList, setPaginatedList] = useState<PagedDataType | null>(
    null,
  );
  const {results, totalPage} = paginatedList || {results: [], totalPage: 0};
  const {privateMenus} = useMailContext();

  const profileCardModal = useModal();
  const {openModal, closeModal, modalConfig} = useModal();

  // 다중 선택 상태 관리
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set(),
  );

  // 검색 상태 관리 (결합 상태)
  const [searchState, setSearchState] = useState({
    keyword: "",
    category: "korNm", // 기본값: 이름
  });

  const [contact, setContact] = useState<PersonalContactType | null>(null);

  const onChangeContact = (e: ChangeEvent<any>) => {
    const {name, value} = e.target;
    setContact((p) => ({
      ...p,
      [name]: value,
    }));
  };

  // 개별 연락처 선택/해제
  const handleContactSelect = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);

    // 선택된 연락처 정보를 부모에게 전달
    const selectedContactData = results.filter((contact: ContactType) =>
      newSelected.has(getContactId(contact)),
    );
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const allIds = results.map((contact: ContactType) => getContactId(contact));
    const newSelected =
      selectedContacts.size === allIds.length
        ? new Set<string>()
        : new Set(allIds);
    setSelectedContacts(newSelected);
  };

  // 연락처 고유 ID 생성 (empNo 또는 idx 사용)
  const getContactId = (contact: ContactType): string => {
    const id = contact.empNo || contact.idx?.toString() || contact.userId || "";
    return id;
  };

  // 연락처 다중선택하여 이동 버튼 눌렀을 때
  const onClickMove = async () => {
    openModal();
  };

  // 연락처 편집 버튼 눌렀을 때
  const onClickEdit = (contactId: number | undefined) => {
    saveLastUrl(pathname);
    router.push(`/mail/contact/add-contact/${contactId}`);
  };

  const onSubmitMove = async () => {
    if (!contact?.folderId) {
      AlertService.error("이동할 폴더를 선택해주세요.");
      return;
    }

    const targetFolderId = contact?.folderId;
    try {
      const requestData = {
        contactIds: Array.from(selectedContacts),
        targetFolderId: targetFolderId,
      };

      const res = await requestPost(
        "/mail/upsertBulkPersonalContact",
        requestData,
      );

      if (res.statusCode === 200) {
        AlertService.success(
          `${selectedContacts.size}개 연락처의 폴더 이동이 완료되었습니다.`,
        );
        getPaginatedContacts(activeMenuId, currentPage);
        setSelectedContacts(new Set());
        setContact(null);
        closeModal();
      } else {
        AlertService.error("연락처 폴더 이동에 실패하였습니다.");
        console.error("이동 실패:", res);
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
    }
  };

  // 선택된 연락처들 즐겨찾기/해제 벌크 처리
  const onClickBulkFavorite = async (isAddingToFavorites: boolean) => {
    if (selectedContacts.size === 0) {
      AlertService.error("선택된 연락처가 없습니다.");
      return;
    }

    const selectedContactsData = results.filter((contact: ContactType) =>
      selectedContacts.has(getContactId(contact)),
    );

    try {
      // 개인 연락처와 사내 연락처 분리
      const personalContacts = selectedContactsData.filter(
        (contact) => !isNotEmpty(contact.empNo),
      );
      const companyContacts = selectedContactsData.filter((contact) =>
        isNotEmpty(contact.empNo),
      );

      const promises = [];

      // 개인 연락처 bulk 처리
      if (personalContacts.length > 0) {
        const personalContactIds = personalContacts.map((contact) =>
          contact.idx.toString(),
        );
        promises.push(
          requestPost("/mail/favoriteBulkPersonalContact", {
            contactIds: personalContactIds,
            isFavorite: isAddingToFavorites,
          }),
        );
      }

      // 사내 연락처는 기존 방식대로 개별 처리
      if (companyContacts.length > 0) {
        const companyPromises = companyContacts.map(async (contact) => {
          return requestPost("/mail/createOrDeleteFavoriteContact", {
            targetType: FavoriteContactTargetEnum.company,
            targetId: contact.empNo,
          });
        });
        promises.push(...companyPromises);
      }

      const results_api = await Promise.all(promises);

      // 모든 요청이 성공했는지 확인
      const allSuccessful = results_api.every((res) => res.statusCode === 200);

      if (allSuccessful) {
        const message = isAddingToFavorites
          ? `${selectedContacts.size}개의 연락처가 즐겨찾기에 추가되었습니다.`
          : `${selectedContacts.size}개의 연락처가 즐겨찾기에서 제거되었습니다.`;

        AlertService.success(message);

        // 목록 새로고침 및 선택 상태 초기화
        getPaginatedContacts(activeMenuId, currentPage);
        setSelectedContacts(new Set());
      } else {
        AlertService.error("일부 연락처 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("즐겨찾기 벌크 처리 오류:", error);
      AlertService.error("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
  };

  // 선택된 연락처들 삭제 벌크 처리
  const onClickBulkDelete = async () => {
    if (selectedContacts.size === 0) {
      AlertService.error("선택된 연락처가 없습니다.");
      return;
    }

    const executeDeletion = async () => {
      try {
        const requestData = {
          contactIds: Array.from(selectedContacts),
        };

        const res = await requestPost(
          "/mail/deleteBulkPersonalContact",
          requestData,
        );

        if (res.statusCode === 200) {
          AlertService.success(
            `${selectedContacts.size}개의 연락처가 삭제되었습니다.`,
          );
          getPaginatedContacts(activeMenuId, currentPage);
          setSelectedContacts(new Set());
        } else {
          AlertService.error("연락처 삭제에 실패했습니다.");
          console.error("삭제 실패:", res);
        }
      } catch (error) {
        console.error("삭제 API 호출 오류:", error);
        AlertService.error("연락처 삭제 중 오류가 발생했습니다.");
      }
    };

    AlertService.warn(
      `선택된 ${selectedContacts.size}개의 연락처를 삭제하시겠습니까?`,
      {
        useConfirmBtn: true,
        useCancelBtn: true,
        onConfirm: () => executeDeletion(),
        onCancel: () => {
          return;
        },
      },
    );
  };

  // 검색 처리
  const handleSearch = (keyword: string) => {
    setSearchState((prev) => ({...prev, keyword}));
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 검색 카테고리 변경 처리
  const handleSearchCategoryChange = (category: string) => {
    setSearchState((prev) => ({...prev, category}));
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 이동
  };

  // 페이지네이션 처리
  const [currentPage, setCurrentPage] = useState(1);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  useEffect(() => {
    if (!activeMenuId) return;
    if (!menuNodeMap[activeMenuId]) return;
    getPaginatedContacts(activeMenuId, currentPage);
  }, [activeMenuId, currentPage, searchState, menuNodeMap]);

  async function getPaginatedContacts(menuId: string, page?: number) {
    const buildParam = menuNodeMap[menuId];
    if (!buildParam) return;
    const option = {...buildParam()};
    option.page = page ?? currentPage;
    option.searchKeyword = searchState.keyword; // 검색 키워드 추가
    option.searchCategory = searchState.category; // 검색 카테고리 추가

    const requestData = {
      option: {
        ...option,
        erpPayload: {
          empType: ["1", "2", "3", "4"],
          jobType: ["J"],
        },
      },
    };

    const res = await requestPost("/mail/getPaginatedContacts", requestData);
    if (res.statusCode === 200) {
      setPaginatedList(res.data);
    } else {
      console.error("API 호출 실패:", res);
    }
  }

  function onClickContact(userId: string) {
    profileCardModal.openModal();
  }

  const onCheck = async (
    targetId: string | number | undefined,
    targetType: FavoriteContactTargetEnum,
  ) => {
    const res = await requestPost("/mail/createOrDeleteFavoriteContact", {
      targetType: targetType,
      targetId: targetId,
    });

    if (res.statusCode === 200) {
      const action = res.data?.action;
      const message =
        action === "added"
          ? "즐겨찾기에 추가되었습니다."
          : "즐겨찾기에서 제거되었습니다.";
      AlertService.success(message);

      setPaginatedList((prev) => {
        if (!prev) return prev;
        const updatedResults = prev.results.map((contact) => {
          if (
            targetType === FavoriteContactTargetEnum.company &&
            contact.empNo === targetId
          ) {
            return {...contact, isImportant: !contact.isImportant};
          } else if (
            targetType === FavoriteContactTargetEnum.personal &&
            contact.idx === targetId
          ) {
            return {...contact, isImportant: !contact.isImportant};
          }
          return contact;
        });
        return {...prev, results: updatedResults};
      });
    }
  };

  // 전체 선택 상태 계산
  const isAllSelected =
    results.length > 0 && selectedContacts.size === results.length;

  // 선택된 연락처들이 모두 즐겨찾기 상태인지 계산
  const selectedContactsData = results.filter((contact: ContactType) =>
    selectedContacts.has(getContactId(contact)),
  );
  const areAllSelectedFavorites =
    selectedContactsData.length > 0 &&
    selectedContactsData.every((contact) => contact.isImportant);

  return (
    <>
      <div className={styles.listWrapper}>
        <div className={styles.mailListContainer}>
          <ContactHeaderBtnGroup
            areAllSelectedFavorites={areAllSelectedFavorites}
            hasSelectedContacts={selectedContacts.size > 0}
            onClickMove={onClickMove}
            onClickBulkFavorite={onClickBulkFavorite}
            onClickBulkDelete={onClickBulkDelete}
            searchKeyword={searchState.keyword}
            searchCategoryOptions={searchCategory}
            selectedSearchCategory={searchState.category}
            onSearchCategoryChange={handleSearchCategoryChange}
            onSearch={handleSearch}
          />
          <ContactListHeader
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            hasPersonalContacts={results.some(
              (contact) => !isNotEmpty(contact.empNo),
            )}
          />
          {results && results.length > 0 ? (
            results.map((contact: ContactType, index: number) => {
              const isCompany = isNotEmpty(contact.empNo);
              return (
                <ContactListLine
                  key={index}
                  onClickContact={() => onClickContact(contact.userId || "")}
                  onCheck={() =>
                    onCheck(
                      isCompany ? contact.empNo : contact.idx,
                      isCompany
                        ? FavoriteContactTargetEnum.company
                        : FavoriteContactTargetEnum.personal,
                    )
                  }
                  contact={contact}
                  isSelected={selectedContacts.has(getContactId(contact))}
                  onContactSelect={() =>
                    handleContactSelect(getContactId(contact))
                  }
                  onClickEdit={() => onClickEdit(contact.idx)}
                  isCompany={isCompany}
                />
              );
            })
          ) : (
            <div className={styles.noContact}>연락처가 없습니다.</div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPage}
          onPageChange={paginate}
        ></Pagination>
      </div>

      <ProfileCard profileCardModal={profileCardModal} />

      <Modal
        modalConfig={modalConfig}
        closeModal={closeModal}
        modalTitle={"이동할 폴더 선택"}
        footerContent={
          <CommonButtonGroup
            usedButtons={{btnSubmit: true}}
            submitBtnLabel="선택"
            onCancel={closeModal}
            onSubmit={onSubmitMove}
          />
        }
        width="20rem"
        height="11rem"
      >
        <SelectBoxBasic
          label="폴더"
          name="folderId"
          value={contact?.folderId}
          customOptions={privateMenus}
          onChange={onChangeContact}
          width="10rem"
        />
      </Modal>
    </>
  );
}
