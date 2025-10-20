import type {NextConfig} from "next";
import path from "path";

const nextConfig: NextConfig = {
	// output: "standalone", // stage 환경에서는 비활성화
	sassOptions: {
		includePaths: [path.join(__dirname, "src/styles")], // styles 폴더를 SCSS 경로로 추가
	},
};

export default nextConfig;
