const BACKEND_API = "https://cdn.sugartech.io/api/";
const TAGSERVICE_API = "https://api.sugartech.io/api/dynamicTag/2/source2";
// const BACKEND_API = "https://dev-cdn.sugartech.io/api/";

const token = localStorage.getItem("auth");

interface ProductPartGroup {
  id: Number;
  title: string;
  code: string;
  invisible: boolean;
  defaultMaterialIds: Array<number>;
  groupIds: Array<number>;
  defaultMaterialCode: number;
  productId: number;
}

export class Api {
  static async login(email: string, password: string) {
    const string = `${email}:${password}`;

    const data = await fetch(BACKEND_API + "login/editor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(string)}`,
      },
    });
    if (data.status == 200)
      localStorage.setItem("auth", `Basic ${btoa(string)}`);

    return data.status;
  }

  static async fetchProductInfo(id: string) {
    if (token) {
      const response = await fetch(BACKEND_API + "editor/get/product/" + id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      return await (response as any).json();
    }
  }

  static async fetchCategoryList() {
    if (token) {
      const response = await fetch(BACKEND_API + "editor/category/list", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      return await (response as any).json();
    }
  }

  static async fetchCompanies() {
    if (token) {
      const data = await fetch(BACKEND_API + "editor/company/list", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      return await (data as any).json();
    }
  }

  static async fetchGlobalCategories() {
    if (token) {
      const data = await fetch(BACKEND_API + "editor/global/category/list", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      return await (data as any).json();
    }
  }

  static async fetchProducts(pageNumber: string, searchKey?: string) {
    const url = new URL(BACKEND_API + "products/list");
    url.searchParams.append("page", pageNumber);
    searchKey && url.searchParams.append("searchKey", searchKey);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
    });
    if (response.status === 200) return await response.json();
    else console.error("Error");
  }

  static async fetchProduct(productId: number, companyId: number) {
    const url = new URL(TAGSERVICE_API);
    url.searchParams.append("productId", productId.toString());
    url.searchParams.append("companyId", companyId.toString());

    const data = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await data.json();
  }

  static async updateProduct(
    id: number,
    name: string,
    companyId: number,
    categoryIds: Array<number>,
    globalCategoryIds: Array<number>
  ) {
    const body = {
      id,
      name,
      companyId,
      categoryIds,
      globalCategoryIds,
    };
    if (token) {
      const response = await fetch(BACKEND_API + "editor/save/updateProduct", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      console.log(name, "name ");

      return response.status;
    }
  }

  static async fetchProductPartGroups(productId: number) {
    if (token) {
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

        return await (response as any).json();
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async fetchMaterialGroups(companyId: number) {
    if (token) {
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

        return await (response as any).json();
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async fetchMaterialSet(materialGroupId: number) {
    if (token && materialGroupId) {
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

        return await (response as any).json();
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async updateProductPartGroup(productPartGroup: ProductPartGroup) {
    if (token) {
      try {
        const response = await fetch(
          BACKEND_API + "product/material/group/part/update",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(productPartGroup),
          }
        );

        return response.status;
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async fetchProductParts(productId: number) {
    if (token) {
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
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async addProductPartGroup(productPartGroup: ProductPartGroup) {
    if (token) {
      try {
        const response = await fetch(
          BACKEND_API + "product/material/group/part/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(productPartGroup),
          }
        );

        return response.status;
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async fetchUserCompanyId() {
    if (token) {
      try {
        const response = await fetch(BACKEND_API + "user/userCompanyId", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        return await (response as any).json();
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async deleteProductPartGroup(id: number) {
    if (token) {
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
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async updateOrAddNewMaterialGroup(
    companyId: number,
    id?: number,
    name?: string,
    materials?: Array<number>
  ) {
    const response = await fetch(BACKEND_API + "material/savegroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({
        id: id,
        name: name,
        materials: materials,
        company: {
          id: companyId,
        },
      }),
    });

    if (response.status === 200) return await response.json();
    else console.error("Error");
  }
  static async fetchMaterialListPaged(pageNumber: string, searchKey?: string) {
    if (token) {
      if (searchKey) {
        const response = await fetch(
          BACKEND_API +
            "material/listAndSearch?page=" +
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
        return await (response as any).json();
      } else {
        const response = await fetch(
          BACKEND_API + "material/listAndSearch?page=" + pageNumber,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        return await (response as any).json();
      }
    }
  }
  static async removeMaterialFromGroup(materialId: number, groupId: number) {
    if (token) {
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
      } catch (err) {
        console.error(err);
      }
    }
  }
}
