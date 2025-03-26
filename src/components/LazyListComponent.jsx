import React, { useEffect, useRef, useState } from 'react';
import { BiGridSmall, BiListUl, BiSolidGrid } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { ThreeDot } from 'react-loading-indicators';
import ListItem from './ListItem.jsx';
export default function LazyListComponent({
  apiFunction,
  onClickItem,
  maxHeight,
  defaultViewType,
  isMultiSelect,
  setSelectedItems,
  selectedItems,
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [searchText, setSearchText] = useState();
  const [viewType, setViewType] = useState(defaultViewType ? defaultViewType : 0);
  const [selectedItemsIds, setSelectedItemsIds] = useState([]);

  const inputref = useRef(null);

  useEffect(() => {
    inputref.current.addEventListener('keydown', function (event) {
      if (event.key != "Enter")
        event.stopPropagation();
    });
  }, []);

  const fetchItems = async (pageNumber, searchKey) => {
    setLoading(true);
    try {
      const data = searchKey
        ? await apiFunction(String(pageNumber), searchKey)
        : await apiFunction(String(pageNumber));

      if (data?.content && Array.isArray(data?.content)) {
        if (searchKey)
          setItems(data.content);
        else
          setItems((prev) => [...prev, ...data.content]);
        if (data.content.length === 0 || data.last)
          setHasMore(false);
      } else {
        console.error("Unexpected API response structure:", data);
        setHasMore(false);
      }
    } catch (error) {
      console.error("API çağrısında hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  function handleSearch() {
    setPage(0);
    fetchItems(page, searchText);
  }


  useEffect(() => {
    if (hasMore)
      fetchItems(page);
  }, [page]);



  function handleClickItem(item) {

    if (isMultiSelect) {
      if (selectedItemsIds.includes(item.id)) {
        setSelectedItems(prev => prev.filter(i => i.id != item.id));
        setSelectedItemsIds(prev => prev.filter(i => i != item.id));
        return;
      }

      let materialSet = new Set();
      selectedItems.map(i => materialSet.add(i));
      materialSet.add(item);
      setSelectedItems(Array.from(materialSet));
      setSelectedItemsIds(prev => [...prev, item.id]);

    } else onClickItem(item);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore)
          setPage((prev) => prev + 1);
      },
      { root: null, rootMargin: '10px', threshold: 0.9 }
    );
    if (loader.current)
      observer.observe(loader.current);


    return () => observer.disconnect();
  }, [loading, hasMore]);



  return (
    <div id='productContainer' ref={inputref}>
      <div id='productSearch'>
        <input id="input"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={"Search.."}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              handleSearch();
          }}
        />
        <div id='productSearchIcon' onClick={handleSearch}>
          <FaSearch color='#888' />
        </div>
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
      <div id="productList" style={{ maxHeight: maxHeight && maxHeight, position: "relative" }} className={viewType !== 0 ? (viewType === 1 ? "dual" : "trio") : ""}>
        {items.map((item, index) => (
          <ListItem
            key={index}
            handleClickItem={() => handleClickItem(item)}
            id={item.id}
            isSelectable={selectedItemsIds.includes(item.id)}
            thumbnailFileUrl={item.thumbnailFileUrl}
            name={item.name}
            viewType={viewType}

          />
        ))}
        <div ref={loader} id='loadingIndicator' style={{ textAlign: 'center' }}>
          {loading && <ThreeDot color="#828d8a" size="small" textColor="#888" />}
        </div>
        {!hasMore && <p style={{ textAlign: 'center', marginTop: '10px' }}>No more items to load</p>}
      </div>
    </div>

  );
}
