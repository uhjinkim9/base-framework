export type RoleType = {
	tempIdx?: number;
	roleId: string;
	roleNm: string;
	memo?: string;
	creatorId?: string;
	updaterId?: string;
	isUsed: boolean;
	createdAt?: Date;
	updatedAt?: Date;
};

export type RoleMenuMapType = {
	idx?: number;
	roleId: string;
	menuId: string;
	creatorId?: string;
	updaterId?: string;
	roleUser: boolean;
	roleAdmin: boolean;
	// isWritable: boolean;
	// isReadable: boolean;
	isUsed: boolean;
	createdAt?: Date;
	updatedAt?: Date;
};
