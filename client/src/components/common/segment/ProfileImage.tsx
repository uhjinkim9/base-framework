import {sizeHeight} from "@mui/system";
import styles from "./styles/profileImage.module.scss";

interface ProfileImageProps {
	path: string;
	alt?: string;
	size?: string | number;
}

export default function ProfileImage({path, alt, size}: ProfileImageProps) {
	return (
		<>
			{/* 왼쪽: 프로필 사진 */}
			<div className={styles.profile}>
				<img
					src={path}
					alt={alt}
					className={styles.profileImage}
					style={size ? {width: size, height: size} : undefined}
				/>
			</div>
		</>
	);
}
