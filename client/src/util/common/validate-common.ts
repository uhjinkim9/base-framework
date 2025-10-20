import AlertService from "@/services/alert.service";

export const validateFolderNm = (folderNm: string): boolean => {
  if (!folderNm || folderNm.trim() === "") {
    AlertService.error("폴더명을 입력해주세요.");
    return false;
  }
  return true;
};
