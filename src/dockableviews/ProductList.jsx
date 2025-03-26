import React from 'react';
import * as Dockable from "@hlorenzi/react-dockable";
import { Api } from '../api/Api';

import LazyListComponent from '../components/LazyListComponent.jsx';

export default function ProductList() {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("ProductList");
    ctx.setPreferredSize(600, 500);


    function toggleYukle(item) {
        window.editor.loader.loadSugarModel(item.customerId, item.companyId);
    }

    return (
        <div id='productContainer'>
            <LazyListComponent
                apiFunction={Api.fetchProducts}
                onClickItem={toggleYukle}
            />
        </div >
    );
}