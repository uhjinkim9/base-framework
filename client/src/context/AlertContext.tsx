"use client";
import {
	createContext,
	useContext,
	useCallback,
	useState,
	useEffect,
} from "react";
import {createPortal} from "react-dom";

import {generateUUID} from "@/util/helpers/random-generator";

import useIsMounted from "@/hooks/useIsMounted";
import AlertService from "@/services/alert.service";

import Alert from "@/components/common/feedback/Alert";
import {AlertItemType} from "@/components/common/feedback/etc/alert.type";

type AlertContextType = {
	showAlert: (params: Omit<AlertItemType, "id">) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlertContext() {
	const context = useContext(AlertContext);
	if (!context) throw new Error("useAlert must be used within AlertProvider");
	return context;
}

export function AlertProvider({children}: {children: React.ReactNode}) {
	const [alerts, setAlerts] = useState<AlertItemType[]>([]);
	const isMounted = useIsMounted();

	const showAlert = useCallback((params: Omit<AlertItemType, "id">) => {
		const id = generateUUID();
		setAlerts((prev) => [...prev, {id, ...params}]);
	}, []);

	const removeAlert = useCallback((id: string) => {
		setAlerts((prev) => prev.filter((a) => a.id !== id));
	}, []);

	useEffect(() => {
		AlertService.register(showAlert);
	}, [showAlert]);

	return (
		<AlertContext.Provider value={{showAlert}}>
			{children}
			{/* 클라이언트에서만 포탈 렌더링 */}
			{isMounted &&
				createPortal(
					<div
						style={{
							position: "fixed",
							bottom: "20px",
							right: "20px",
							zIndex: 1000,
							display: "flex",
							flexDirection: "column-reverse",
							gap: "10px",
						}}
					>
						{alerts.map((alert) => (
							<Alert
								key={alert.id}
								{...alert}
								id={alert.id}
								onRemoveRequest={removeAlert}
							/>
						))}
					</div>,
					document.body
				)}
		</AlertContext.Provider>
	);
}
