import React, { useRef, useState, useEffect } from 'react';
import { BiListUl, BiGridSmall, BiSolidGrid } from "react-icons/bi";
import { GoPlus } from "react-icons/go";
import ListItem from './ListItem.jsx';

export default function ListComponent({
    items,
    defaultViewType,
    maxHeight,
    onClickItem,
    onDeleteItem,
    showDelete
}) {
    const [searchText, setSearchText] = useState("");
    const [viewType, setViewType] = useState(defaultViewType ? defaultViewType : 0);

    const inputref = useRef(null);

    useEffect(() => {
        inputref.current.addEventListener('keydown', function (event) {
            event.stopPropagation();
        });
    }, []);

    let filteredItems = items.filter((item) => {
        if (item.name || item.label) return item.label ? item.label.toLowerCase().includes(searchText.toLowerCase()) : item.name.toLowerCase().includes(searchText.toLowerCase());
        else return item.value ? item.value.toString().toLowerCase().includes(searchText.toLowerCase()) : item.id.toString().toLowerCase().includes(searchText.toLowerCase());
    });

    return (
        <div id='productContainer' ref={inputref}>
            <div id='productSearch'>
                <input id="input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={"Search.."}
                />
                <div id='viewTypeButton'
                    style={{ background: viewType === 0 ? "#888" : "#222" }}
                    onClick={() => setViewType(0)}
                >
                    <BiListUl color={viewType === 0 ? "#222" : '#888'} />
                </div>
                <div id='viewTypeButton'
                    style={{ background: viewType === 1 ? "#888" : "#222" }}
                    onClick={() => setViewType(1)}
                >
                    <BiGridSmall color={viewType === 1 ? "#222" : '#888'} />
                </div>
                <div id='viewTypeButton'
                    style={{ background: viewType === 2 ? "#888" : "#222" }}
                    onClick={() => setViewType(2)}
                >
                    <BiSolidGrid color={viewType === 2 ? "#222" : '#888'} />
                </div>

            </div>
            <div id="productList" style={{ maxHeight: maxHeight && maxHeight, position: "relative", paddingTop: "15px" }} className={viewType !== 0 ? (viewType === 1 ? "dual" : "trio") : ""}>
                {
                    filteredItems.map((item, index) => {
                        return (
                            <ListItem
                                key={index}
                                thumbnailFileUrl={item.thumbnailFileUrl && item.thumbnailFileUrl}
                                id={item.id}
                                name={item.label ? item.label : item.name}
                                handleClickItem={() => { onClickItem && onClickItem(item); }}
                                viewType={viewType}
                                onDelete={() => onDeleteItem(item)}
                                showDelete={showDelete}
                            />
                        );
                    })
                }
            </div>

        </div>
    );
}
