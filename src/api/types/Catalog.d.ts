export class Catalog {
	company: Company;
	categories: CatalogCategory[];
}

export class Company {
	id: number;
	imageUrl: string;
	name: string;
}

export class CatalogCategory {
	id: number;
	name: string;
	catelogIndex: number;
	products: CatalogProduct[];
	thumbnailFileUrl: string;
}

export class CatalogProduct {
	id: number;
	name: string;
	orderIndex: number;
	thumbnailFileUrl: string;
}