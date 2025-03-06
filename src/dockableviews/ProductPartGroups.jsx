import * as Dockable from "@hlorenzi/react-dockable";
import React, { useEffect, useRef, useState } from "react";
import { FaRegDotCircle } from "react-icons/fa";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { MdEditSquare } from "react-icons/md";
import { ThreeDot } from "react-loading-indicators";
import Select from "react-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api } from "../api/Api";
import AddButton from "../components/AddButton.jsx";
import { useProductContext } from "../context/ProductContext.jsx";
import MaterialGroupsList from "./MaterialGroupsList.jsx";

const ProductPartGroups = ({ dockState }) => {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("Product Part Groups");

    const { getMaterialListById, setProductId, productId } = useProductContext();


    const [isLoading, setIsLoading] = useState(false);
    const [parts, setParts] = useState([]);
    const [productPartGroupList, setProductPartGroupList] = useState([]);



    async function getProductPartGroups(productId) {
        setIsLoading(true);
        const productPartGroups = await Api.fetchProductPartGroups(productId);
        productPartGroups.map(async i => {
            for (let item of i.groups) {
                await getMaterialListById(item.value, false);
            }

        });
        setIsLoading(false);
        return productPartGroups;
    }

    async function fetchProductParts(productId) {
        setIsLoading(true);
        const parts = await Api.getProductParts(productId);
        const response = parts.map((item) => {
            return { value: item.id, label: item.name };
        });
        setIsLoading(false);
        console.log(response);
        return response;
    }


    async function setProductPartGroup() {
        if (productId)
            setProductPartGroupList(await getProductPartGroups(productId));
    }

    async function setProductParts() {
        if (productId)
            setParts(await fetchProductParts(productId));
    }

    useEffect(() => {
        setProductPartGroup();
        setProductParts();
    }, [productId]);


    function handleAddProductGroup() {
        const newGroup = {
            title: "",
            code: "",
            parts: [],
            groups: [],
            defaultMaterialCode: "",
            defaultMaterialIds: [],
            invisible: false,
            isVisible: false,
            productId: productId
        };

        setProductPartGroupList((prev) => [...prev, newGroup]);
    }

    function toggleVisibility(index) {
        setProductPartGroupList((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, isVisible: !item.isVisible } : item
            )
        );
    }

    function toggleDelete(indexToDelete) {
        setProductPartGroupList((prevList) =>
            prevList.filter((_, index) => index !== indexToDelete)
        );
    }

    const successMessage = (message) => toast.success(message, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        closeOnClick: true,
        theme: "dark",
        // transition: "Slide",
    });

    const errorMessage = (message) => toast.error(message, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        // transition: "Bounce",
    });

    if (isLoading)
        return (
            <div style={{
                display: "flex", alignItems: "start", justifyContent: "center", height: "100%", paddingTop: "20px"
            }}>
                <ThreeDot color="#828d8a" size="medium" text="" textColor="#925959" />
            </div>
        );
    return (
        <div id="productPartGroups">
            <ToastContainer position="bottom-left"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" />
            <div style={{
                width: "100%",
                // maxWidth: "300px",
                display: "flex",
                flexDirection: "row-reverse"
            }}>
                <AddButton onClickButton={handleAddProductGroup} tooltip={"New Product Part Group"} />
                {/* <div id="addProductPart" onClick={handleAddProductGroup}>
                    <GoPlus />
                    Add
                </div> */}
            </div>

            {productPartGroupList && productPartGroupList.map((item, index) => (
                <div key={index} id="partGroup" style={{ backgroundColor: item.isVisible ? "#111" : "transparent" }}>
                    <div id="partGroupTitle" onClick={() => toggleVisibility(index)}>
                        <FaRegDotCircle />
                        <span>
                            {item.title}
                        </span>
                    </div>
                    <PartGroupInputs
                        item={item}
                        index={index}
                        toggleDelete={toggleDelete}
                        parts={parts}
                        setIsLoading={setIsLoading}
                        successMessage={successMessage}
                        errorMessage={errorMessage}
                        dockState={dockState}
                    />
                </div>
            ))}
        </div>
    );
};


const PartGroupInputs = ({
    item,
    index,
    toggleDelete,
    parts,
    successMessage,
    errorMessage,
    dockState
}) => {

    const inputref = useRef();

    const { companyMaterialGroups, defaultMaterialSet, getMaterialListById, companyId } = useProductContext();

    const [code, setCode] = useState(item.code);
    const [name, setName] = useState(item.title);
    const [invisible, setInvisible] = useState(item.invisible);
    const [selectedMaterialGroup, setSelectedMaterialGroup] = useState(item.groups);
    const [materialGroupsOptions, setMaterialGroupsOptions] = useState([]);
    const [selectedParts, setSelectedParts] = useState(item.parts);
    const [defaultMaterialOptions, setDefaultMaterialOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDefaultMaterial, setSelectedDefaultMaterial] = useState();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [isDelete, setIsDelete] = useState(false);





    async function onChangeSelectedMaterialGroup(selectedMaterialGroupList) {
        setIsLoading(true);
        for (let group of selectedMaterialGroupList) {
            const resGroup = await getMaterialListById(group.value, false);
        };

        setIsLoading(false);
        setSelectedMaterialGroup(selectedMaterialGroupList);

    };

    useEffect(() => {
        setIsLoading(true);
        let materialList = new Set();
        defaultMaterialSet.map(materialSet => {
            selectedMaterialGroup.map(material => {
                if (materialSet.id == material.value)
                    materialSet.data.map(i => materialList.add(i));
            });
        });
        setDefaultMaterialOptions(Array.from(materialList));
        setIsLoading(false);
    }, [defaultMaterialSet, selectedMaterialGroup, companyId]);

    useEffect(() => {
        //defaultMaterial set etme
        setIsLoading(true);
        defaultMaterialOptions.map(material => {
            if (material.value == item.defaultMaterialId)
                setSelectedDefaultMaterial({ value: material.value, label: material.label });
        });
        setIsLoading(false);

    }, [defaultMaterialOptions, companyId]);

    useEffect(() => {
        // Seçili materyal gruplarına göre defaultMaterialOptions'u sıfırla ve yeniden oluştur
        companyMaterialGroups.map(i => {
            setMaterialGroupsOptions(prev => [...prev, { value: i.id, label: i.name ? i.name : i.id }]);
        });

    }, [selectedMaterialGroup, companyId]);


    const customStylesSelect = {
        option: (defaultStyles, state) => ({
            ...defaultStyles,
            color: state.isSelected ? "#212529" : "#fff",
            backgroundColor: state.isSelected ? "#a0a0a0" : "#212529",
            // maxHeight: "40px",
            overflowX: "hidden"
        }),
        control: (defaultStyles) => ({
            ...defaultStyles,
            backgroundColor: "#222",
            border: "none",
            boxShadow: "none",
            color: "#fff"
        }),
        singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#888" }),

    };

    const customStyleModal = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: "30%",
        bgcolor: '#222',
        // border: '2px solid #000',
        boxShadow: 0,
        p: 4,
        outline: "none",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    };




    async function toggleSave() {
        setIsOpenModal(false);

        const data = {
            title: name,
            code: code,
            invisible,
            defaultMaterialCode: selectedDefaultMaterial ? selectedDefaultMaterial.value : [],
            productId: item.productId,
            groupIds: selectedMaterialGroup ? selectedMaterialGroup.map(i => i.value) : [],
            partIds: selectedParts ? selectedParts.map(i => i.value) : [],
            defaultMaterialIds: []
        };
        setIsLoading(true);
        let res;
        if (item.id)
            res = await Api.updateProductPartGroup({ ...data, id: item.id });
        else
            res = await Api.addProductPartGroup({ ...data });

        setIsLoading(false);

        if (res == 200) successMessage("ProductPartGroup updated successfully!");
        else errorMessage("Error!");

    }

    async function handleDelete() {
        setIsOpenModal(false);
        toggleDelete(index);

        setIsLoading(true);
        const res = await Api.deleteProductPartGroup(item.id);
        setIsLoading(false);

        if (res == 200) successMessage("Product deleted succesfully!");
        else errorMessage("Error while delete proces!");

    }

    function onClickSaveButton() {
        setIsOpenModal(true);
        setIsDelete(false);
        setModalMessage("Product will be updated!");
    }

    function onClickDeleteButton() {
        setIsOpenModal(true);
        setIsDelete(true);
        setModalMessage("Product will be deleted!");
    }

    useEffect(() => {
        inputref.current.addEventListener('keydown', function (event) {
            event.stopPropagation();
        });
    }, []);

    function onClickEdit() {
        Dockable.spawnFloating(
            dockState,
            <MaterialGroupsList dockState={dockState} />
        );
    }

    const CustomOption = (props) => {
        const { data, innerRef, innerProps } = props;

        return (
            <div
                ref={innerRef}
                {...innerProps}
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    cursor: "pointer",
                    color: props.isFocused ? "#212529" : "#fff",
                    backgroundColor: props.isFocused ? "#a0a0a0" : "#212529",
                }}
            >
                <img
                    src={data.thumbnailFileUrl}
                    alt={data.label}
                    style={{ width: "20px", height: "20px", marginRight: "10px" }}
                />
                {data.label}
            </div>
        );
    };


    if (isLoading && item.isVisible)
        return (
            <div style={{
                display: "flex", alignItems: "start", justifyContent: "center", height: "100%", paddingTop: "20px", paddingBottom: "90px"
            }}>
                <ThreeDot color="#828d8a" size="medium" text="" textColor="#925959" />
            </div>
        );


    return (
        <div ref={inputref} style={{ display: item.isVisible ? "flex" : "none" }} id="partGroupInputs">

            <Modal
                open={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                style={{
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none',
                }}
            >
                <Box sx={customStyleModal}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Are you sure?
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {modalMessage}
                    </Typography>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                        paddingTop: 10
                    }}>
                        <Button variant="outlined" color="success" onClick={isDelete ? handleDelete : toggleSave}>
                            Yes
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => setIsOpenModal(false)}>
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>


            <div id="inputDiv">
                <span>Name</span>
                <input id="input" value={name} onChange={(e) => { setName(e.target.value); }} type="text" placeholder="Name"
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                />
            </div>
            <div id="inputDiv">
                <span>Code</span>
                <input id="input" value={code} onChange={(e) => { setCode(e.target.value); }} type="text" placeholder='Code' />
            </div>
            <div id="inputDiv">
                <span>Parts</span>
                <Select
                    id="selectParts"
                    value={selectedParts}
                    isMulti
                    placeholder="Parts"
                    name="parts"
                    onChange={setSelectedParts}
                    options={parts}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customStylesSelect}
                />
            </div>
            <div id="inputDiv">
                <span>Material Groups</span>
                <Select
                    id="selectParts"
                    value={selectedMaterialGroup}
                    isMulti
                    onChange={onChangeSelectedMaterialGroup}
                    placeholder="Material Groups"
                    name="materialGroups"
                    options={materialGroupsOptions}
                    isLoading={isLoading}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={customStylesSelect}
                />
                <div id="productSearchIcon" onClick={onClickEdit}>
                    <MdEditSquare color='#888' />
                </div>
            </div>
            <div id="inputDiv">
                <span>Default Material</span>
                <Select
                    id="selectParts"
                    value={selectedDefaultMaterial}
                    placeholder="Default Material"
                    name="defaultMaterial"
                    isLoading={isLoading}
                    onChange={setSelectedDefaultMaterial}
                    options={defaultMaterialOptions}
                    styles={customStylesSelect}
                    components={{ Option: CustomOption }}
                />
            </div>
            <div id="inputDiv" style={{ justifyContent: "start" }}>
                <span>Invisible</span>
                <input style={{
                    alignSelf: "start",
                    width: "10%", minWidth: "0"
                }}
                    type="checkbox"
                    value={invisible}
                    onChange={(e) => setInvisible(!invisible)}
                />
            </div>
            <div className="buttons">
                <div className="saveButton" onClick={onClickSaveButton}>
                    Save
                </div>
                <div className="deleteButton" onClick={onClickDeleteButton}>
                    Delete
                </div>
            </div>


        </div>
    );
};

export default ProductPartGroups;