import React from "react";
import styles from "./styles/Pagination.module.scss";
import {
	MdKeyboardDoubleArrowLeft,
	MdKeyboardDoubleArrowRight,
	MdKeyboardArrowLeft,
	MdKeyboardArrowRight,
} from "react-icons/md";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const visiblePages = 10; // 표시할 페이지 수

	// 현재 페이지가 속한 그룹 계산 (1-10, 11-20, 21-30...)
	const currentGroup = Math.ceil(currentPage / visiblePages);
	const start = (currentGroup - 1) * visiblePages + 1;
	const end = Math.min(totalPages, currentGroup * visiblePages);

	const pages = Array.from({length: end - start + 1}, (_, i) => start + i);

	return (
		<nav className={styles.pagination}>
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
			>
				{/* <MdKeyboardDoubleArrowLeft className={styles.icon} /> */}
				<MdKeyboardArrowLeft className={styles.icon} />
			</button>

			<ul className={styles.list}>
				{pages.map((page) => (
					<li
						key={page}
						onClick={() => onPageChange(page)}
						className={currentPage === page ? styles.active : ""}
					>
						{page}
					</li>
				))}
			</ul>

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				<MdKeyboardArrowRight className={styles.icon} />
				{/* <MdKeyboardDoubleArrowRight className={styles.icon} /> */}
			</button>
		</nav>
	);
};

export default Pagination;
