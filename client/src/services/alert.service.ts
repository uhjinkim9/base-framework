import {
	AlertItemType,
	ConfirmOptions,
} from "@/components/common/feedback/etc/alert.type";
import {AlertEnum} from "@/components/common/feedback/etc/alert.type";

type AlertOptions = Partial<Omit<AlertItemType, "id" | "type" | "message">> &
	ConfirmOptions;

type ShowAlertFn = (params: Omit<AlertItemType, "id">) => void;

export default class AlertService {
	private static _handler: ShowAlertFn | null = null;

	static register(fn: ShowAlertFn) {
		this._handler = fn;
	}

	static show(params: Omit<AlertItemType, "id">) {
		if (this._handler) {
			this._handler(params);
		} else {
			console.warn("AlertService not registered.");
		}
	}

	static error(message: string, options?: AlertOptions) {
		this.show({type: AlertEnum.ERROR, message, ...options});
	}

	static info(message: string, options?: AlertOptions) {
		this.show({type: AlertEnum.INFO, message, ...options});
	}

	static success(message: string, options?: AlertOptions) {
		this.show({type: AlertEnum.SUCCESS, message, ...options});
	}

	static warn(message: string, options?: AlertOptions) {
		this.show({type: AlertEnum.WARN, message, ...options});
	}
}
