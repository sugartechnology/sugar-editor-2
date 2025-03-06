
export const CONFIGURATOR_API_URL = "https://cdn.sugartech.io/api/configurator/";
export const API_URL = "https://api.sugartech.io/api/dynamicTag/2/source2";

const BACKEND_API = "https://cdn.sugartech.io/api/";
const DEV_CDN_API = "https://cdn.sugartech.io/api/";

let AUTH = "Basic " + btoa( "planner.default@sugartech.io:planner" );
const token = localStorage.getItem( "auth" );

/**
 * @typedef {Object} ProductPartGroup
 * @property {Number} id
 * @property {string} title
 * @property {string} code
 * @property {boolean} invisible
 * @property {Array<number>} defaultMaterialIds
 * @property {Array<number>} groupIds
 * @property {number} defaultMaterialCode
 * @property {number} productId
 */

/**
 * @class Api
 * @description Api class for handling api requests
 */
export class Api {
	static async fetchCatalog( identifier ) {
		const data = await fetch( CONFIGURATOR_API_URL + identifier, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		} );

		return await data.json();
	}

	static async login( email, password ) {
		const string = `${email}:${password}`;

		const data = await fetch( BACKEND_API + "login", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${btoa( string )}`,
			},
		} );
		if ( data.status == 200 )
			localStorage.setItem( "auth", `Basic ${btoa( string )}` );

		return data.status;
	}

	static async fetchProductInfo( id ) {
		if ( token ) {
			const response = await fetch( BACKEND_API + "editor/get/product/" + id, {
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			} );

			return await response.json();
		}
	}

	static async fetchCategoryList( id ) {
		if ( token ) {
			const response = await fetch( DEV_CDN_API + "editor/category/list", {
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			} );

			return await response.json();
		}
	}

	static async fetchCompanies() {
		if ( token ) {
			const data = await fetch( DEV_CDN_API + "editor/company/list", {
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			} );

			return await data.json();
		}
	}

	static async fetchGlobalCategories() {
		if ( token ) {
			const data = await fetch( BACKEND_API + "editor/global/category/list", {
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			} );

			return await data.json();
		}
	}

	static async fetchProducts( pageNumber, searchKey ) {
		if ( token ) {
			if ( searchKey ) {
				const response = await fetch(
					BACKEND_API +
					"products/list?page=" +
					pageNumber +
					"&searchKey=" +
					searchKey,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);
				return await response.json();
			} else {
				const response = await fetch(
					BACKEND_API + "products/list?page=" + pageNumber,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);
				return await response.json();
			}
		}
	}

	static async fetchProduct( productId, companyId ) {
		const url = new URL( API_URL );
		url.searchParams.append( "productId", productId.toString() );
		url.searchParams.append( "companyId", companyId.toString() );

		const data = await fetch( url.toString(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		} );

		return await data.json();
	}

	static async fetchCustomerProduct( customerId, companyId ) {
		let data = await fetch(
			API_URL +
			"?" +
			"productId=" +
			customerId +
			"&" +
			"companyId=" +
			companyId,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		return await data.json();
	}

	/**
	 *
	 * @param {number} id
	 * @param {string} name
	 * @param {number} companyId
	 * @param {Array<number>} categoryIds
	 * @param {Array<number>} globalCategoryIds
	 * @returns
	 */
	static async updateProduct(
		id,
		name,
		companyId,
		categoryIds,
		globalCategoryIds
	) {
		const body = {
			id,
			name,
			companyId,
			categoryIds,
			globalCategoryIds,
		};
		if ( token ) {
			const response = await fetch( BACKEND_API + "editor/save/updateProduct", {
				method: "POST",
				body: JSON.stringify( body ),
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			} );

			console.log( name, "name " );

			return response.status;
		}
	}

	/**
	 *
	 * @param {number} productId
	 * @returns
	 */
	static async fetchProductPartGroups( productId ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "product/material/group/part/getInfo/" + productId,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return await response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {number} companyId
	 * @returns
	 */
	static async fetchMaterialGroups( companyId ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "material/group/list?companyId=" + companyId,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return await response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 * @param {number} materialGroupId
	 * @returns
	 * @memberof Api
	 * @description Fetch material set by material group id
	 * @returns {Promise<any>}
	 * @static
	 */
	static async fetchMaterialSet( materialGroupId ) {
		if ( token && materialGroupId ) {
			try {
				const response = await fetch(
					BACKEND_API + "material/group/materials/" + materialGroupId,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return await response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}


	/**
	 *
	 * @param {ProductPartGroup} productPartGroup
	 * @returns {Promise<number>}
	 */
	static async updateProductPartGroup( productPartGroup ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "product/material/group/part/update",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
						body: JSON.stringify( productPartGroup ),
					}
				);

				return response.status;
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {number} productId
	 * @returns {Promise<any>}
	 */
	static async getProductParts( productId ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "material/list/partAndRules/" + productId,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {ProductPartGroup} productPartGroup
	 * @returns
	 */
	static async addProductPartGroup( productPartGroup ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "product/material/group/part/add",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
						body: JSON.stringify( productPartGroup ),
					}
				);

				return response.status;
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	static async getCompanyId() {
		if ( token ) {
			try {
				const response = await fetch( BACKEND_API + "user/userCompanyId", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				} );

				return await response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {number} id
	 * @returns
	 */
	static async deleteProductPartGroup( id ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "product/material/group/part/delete/" + id,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return response.status;
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {number} companyId
	 * @param {number | undefined} id
	 * @param {string | undefined} name
	 * @param {Array<number>} materialIds
	 * @returns
	 */
	static async updateOrAddNewMaterialGroup(
		companyId,
		id = undefined,
		name = undefined,
		materialIds = null
	) {
		if ( token ) {
			try {
				const response = await fetch( BACKEND_API + "material/savegroup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
					body: JSON.stringify( {
						id: id,
						name: name,
						materials: materialIds,
						company: {
							id: companyId,
						},
					} ),
				} );

				return response.json();
			} catch ( err ) {
				console.error( err );
			}
		}
	}

	/**
	 *
	 * @param {number} pageNumber
	 * @param {string} searchKey
	 * @returns
	 */
	static async listMaterials( pageNumber, searchKey ) {
		const url = new URL( BACKEND_API + "material/listAndSearch" );
		if ( searchKey ) {
			url.searchParams.append( "searchKey", searchKey );
		}
		url.searchParams.append( "page", pageNumber );
		if ( token ) {
			const response = await fetch( url,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				}
			);
			return await response.json();
		}
	}

	/**
	 *
	 * @param {number} materialId
	 * @param {number} groupId
	 * @returns {Promise<number>}
	 */
	static async removeMaterialFromGroup( materialId, groupId ) {
		if ( token ) {
			try {
				const response = await fetch(
					BACKEND_API + "material/remove/" + materialId + "/" + groupId,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					}
				);

				return response.status;
			} catch ( err ) {
				console.error( err );
			}
		}
	}
}
