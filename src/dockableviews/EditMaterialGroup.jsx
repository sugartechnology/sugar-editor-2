import * as Dockable from "@hlorenzi/react-dockable";
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { ThreeDot } from "react-loading-indicators";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api } from '../api/Api.js';
import { useProductContext } from '../context/ProductContext.jsx';

import AddButton from '../components/AddButton.jsx';
import LazyListComponent from '../components/LazyListComponent.jsx';
import ListComponent from '../components/ListComponent.jsx';

export default function EditMaterialGroup({ materialGroup }) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(materialGroup ? materialGroup.name : "");
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenAddModal, setIsOpenAddModal] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [id, setId] = useState(materialGroup && materialGroup.id);

    const { getMaterialListById, companyId, fetchMaterialGroups } = useProductContext();

    const inputref = useRef(null);


    const ctx = Dockable.useContentContext();
    ctx.setTitle("Edit Material Group");

    useEffect(() => {
        inputref.current.addEventListener('keydown', function (event) {
            event.stopPropagation();
        });
    }, []);

    async function getMaterials(id, isChange) {
        setIsLoading(true);
        const res = await getMaterialListById(id, isChange);
        if (res)
            setMaterials(res.data);
        setIsLoading(false);
    }

    useEffect(() => {
        if (materialGroup)
            getMaterials(id, false);
    }, []);

    const customStyleModal = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isOpenModal ? "30%" : "50%",
        bgcolor: '#111',
        // border: '2px solid #000',
        boxShadow: 0,
        p: 4,
        outline: "none",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px"
    };

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

    async function updateMaterialGroup() {
        setIsLoading(true);
        const formatSelectedMaterial = selectedMaterials.map(i => {
            return { value: i.id, label: i.name, thumbnailFileUrl: i.thumbnailFileUrl };
        });
        let materialSet = new Set();
        materials.map(i => materialSet.add(i));
        formatSelectedMaterial.map(i => materialSet.add(i));
        const materialList = Array.from(materialSet);
        const savedMaterials = materialList.map(i => {
            return { id: i.value };
        });

        let res;

        if (id) {
            res = await Api.updateOrAddNewMaterialGroup(companyId, id, name, savedMaterials);
            getMaterials(id, true);
        }
        else {
            res = await Api.updateOrAddNewMaterialGroup(companyId, null, name, savedMaterials);
            setId(res.id);
            getMaterials(res.id, true);
        }

        if (res.id) successMessage("Updated successfuly!");
        else errorMessage("Error while update!");
        fetchMaterialGroups();

        setIsLoading(false);
        setIsOpenModal(false);
        setIsOpenAddModal(false);

    }

    async function deleteMaterialFromGroup(materialId) {
        setIsLoading(true);
        const res = await Api.removeMaterialFromGroup(materialId, id);
        if (res == 200) successMessage("Material deleted!");
        else errorMessage("Error while delete!");

        const response = await getMaterialListById(id, true);
        setMaterials(response.data);

        setIsLoading(false);
    }


    return (
        isLoading
            ?
            <div style={{
                display: "flex", alignItems: "start", justifyContent: "center", height: "100%", paddingTop: "20px", paddingBottom: "90px"
            }}>
                <ThreeDot color="#828d8a" size="medium" text="" textColor="#925959" />
            </div>
            :
            <div id='modalContentContainer' ref={inputref}>
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
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                            paddingTop: 10
                        }}>
                            <Button variant="outlined" color="success" onClick={updateMaterialGroup}>
                                Yes
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => setIsOpenModal(false)}>
                                No
                            </Button>
                        </div>
                    </Box>
                </Modal>

                <Modal
                    open={isOpenAddModal}
                    onClose={() => setIsOpenAddModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    style={{
                        outline: 'none',
                        boxShadow: 'none',
                        border: 'none',
                    }}
                >
                    <Box sx={customStyleModal}>

                        <LazyListComponent
                            apiFunction={Api.fetchMaterialListPaged}
                            onClickItem={(item) => console.log(item)}
                            maxHeight={"500px"}
                            defaultViewType={1}
                            isMultiSelect={true}
                            setSelectedItems={setSelectedMaterials}
                            selectedItems={selectedMaterials}
                        />

                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                            paddingTop: 10
                        }}>
                            <Button variant="outlined" color="success" onClick={updateMaterialGroup}>
                                Save
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => setIsOpenAddModal(false)}>
                                Close
                            </Button>
                        </div>
                    </Box>
                </Modal>

                <div style={{ alignSelf: "flex-end", padding: "5px" }}>
                    <AddButton onClickButton={() => { setIsOpenAddModal(true); setIsOpenModal(false); }} tooltip={"Add Material"} />
                </div>

                <div id='modalInputs' >
                    <div id='modalInputContainer'>
                        <span>Id</span>
                        <span>{id && id}</span>
                    </div>
                    <div id='modalInputContainer'>
                        <span>Name</span>
                        <input
                            id="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={"Name"}
                        />
                    </div>

                </div>

                <div id='materialsContainer'>
                    {
                        materials &&
                        <ListComponent items={materials} showDelete={true} onDeleteItem={(item) => { deleteMaterialFromGroup(item.value); }} />
                    }
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    paddingTop: 10
                }}>
                    <Button variant="outlined" color="success" onClick={() => setIsOpenModal(true)}>
                        Save
                    </Button>


                </div>
            </div>

    );
}
