import React, { useEffect, useRef, useState } from 'react';
import * as Dockable from "@hlorenzi/react-dockable";
import { useProductContext } from '../context/ProductContext.jsx';
import EditMaterialGroup from './EditMaterialGroup.jsx';
import { Api } from '../api/Api.js';
import ListComponent from '../components/ListComponent.jsx';
import AddButton from '../components/AddButton.jsx';

export default function MaterialGroupsList({ dockState }) {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("Material Groups");


    const { companyMaterialGroups, companyId } = useProductContext();

    async function onClickMaterialGroup(item) {
        const dockId = Dockable.spawnFloating(
            dockState,
            <EditMaterialGroup materialGroup={item} />
        );
    }

    async function addMaterialGroup() {
        Dockable.spawnFloating(
            dockState,
            <EditMaterialGroup materialGroup={null} />
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#111" }}>
            <div style={{ alignSelf: "flex-end", padding: "5px" }}>
                <AddButton tooltip={"New Material Group"} onClickButton={addMaterialGroup} />
            </div>
            <ListComponent
                items={companyMaterialGroups}
                defaultViewType={1}
                onClickItem={onClickMaterialGroup}
                maxHeightItem={"50px"}
                maxHeight={"72vh"}
                addButton
                addButtonText={"New Material Group"}
                onClickAddButton={addMaterialGroup}
            />

        </div>
    );
}
