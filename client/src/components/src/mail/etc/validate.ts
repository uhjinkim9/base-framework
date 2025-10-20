import AlertService from "@/services/alert.service";

import {PersonalContactType} from "@/types/mail.type";

export const validateContact = (contact: PersonalContactType): boolean => {
  // korNm
  if (!contact?.korNm || contact?.korNm.trim() === "") {
    AlertService.error("이름을 입력해주세요.");
    return false;
  }
  return true;
};
