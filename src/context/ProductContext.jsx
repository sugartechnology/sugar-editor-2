import React, { createContext, useContext, useEffect, useState } from 'react';
import { Api } from '../api/Api';

// Context oluşturma
const ProductContext = createContext();

// Provider bileşeni
export const ProductProvider = ({ children }) => {

    const [companyMaterialGroups, setCompanyMaterialGroups] = useState();
    const [productId, setProductId] = useState();
    const [productName, setProductName] = useState();
    const [defaultMaterialSet, setDefaultMaterialSet] = useState([]);
    const [companyId, setCompanyId] = useState();


    async function fetchMaterialGroups(id) {
        setCompanyMaterialGroups(await Api.fetchMaterialGroups(id ? id : companyId));
    }

    async function init() {
        const res = await Api.getCompanyId();
        setCompanyId(res);

        if (!companyMaterialGroups)
            fetchMaterialGroups(res);
    }

    useEffect(() => {
        init();
    }, []);


    async function getMaterialListById(groupId, isChange) {
        const existMaterialGroupIds = defaultMaterialSet.map(i => i.id);
        if (isChange) {
            const materialList = await Api.fetchMaterialSet(groupId);
            if (!materialList) return;
            setDefaultMaterialSet(prev => [...prev, {
                id: groupId, data: materialList.map(i => {
                    return { value: i.id, label: i.name, thumbnailFileUrl: i.thumbnailFile };
                })
            }]);
            return {
                id: groupId,
                data: materialList.map(i => {
                    return { value: i.id, label: i.name, thumbnailFileUrl: i.thumbnailFile };
                })
            };
        }
        if (!existMaterialGroupIds.includes(groupId)) {
            const materialList = await Api.fetchMaterialSet(groupId);
            if (!materialList) return;
            setDefaultMaterialSet(prev => [...prev, {
                id: groupId, data: materialList.map(i => {
                    return { value: i.id, label: i.name, thumbnailFileUrl: i.thumbnailFile };
                })
            }]);
            return {
                id: groupId,
                data: materialList.map(i => {
                    return { value: i.id, label: i.name, thumbnailFileUrl: i.thumbnailFile };
                })
            };
        }
        else {
            let materialSet;
            defaultMaterialSet.filter(i => {
                if (i.id == groupId)
                    materialSet = i;
            });
            return materialSet;
        }
    }



    return (
        <ProductContext.Provider
            value={{
                companyMaterialGroups,
                defaultMaterialSet,
                setCompanyMaterialGroups,
                getMaterialListById,
                productId,
                setProductId,
                productName,
                setProductName,
                companyId,
                fetchMaterialGroups
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error(
            'useProductContext must be used within a ProductProvider'
        );
    }
    return context;
};