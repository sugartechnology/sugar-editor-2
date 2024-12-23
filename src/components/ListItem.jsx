import React, { useState } from 'react';
import { IoMdCloseCircle } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from '@mui/material';
export default function ListItem({
    handleClickItem,
    thumbnailFileUrl,
    name,
    id,
    isSelectable,
    viewType,
    onDelete,
    showDelete
}) {
    const [isOpenModal, setIsOpenModal] = useState(false);

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


    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: "95%" }}>

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
                        Item will be deleted!
                    </Typography>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                        paddingTop: 10
                    }}>
                        <Button variant="outlined" color="success" onClick={onDelete}>
                            Yes
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => setIsOpenModal(false)}>
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            <div id='productListItem' style={{
                flexDirection: viewType == 0 ? "row" : "column",
                backgroundColor: isSelectable && "#888",
                position: "relative",
                padding: viewType == 0 ? " 5px" : "5px"
            }} onClick={handleClickItem} >

                {
                    thumbnailFileUrl &&
                    <img style={{
                        width: viewType == 0 ? "40px" : "90%",
                        height: viewType == 0 ? "30px" : "100px",
                        objectFit: "contain"
                    }} src={thumbnailFileUrl} alt={name} />
                }
                <span style={{ color: isSelectable && "#111" }}>{name ? name : id}</span>
            </div>
            {
                showDelete &&
                <Tooltip title={"Delete"}>
                    <div id='closeIcon' onClick={() => setIsOpenModal(true)}>
                        <IoMdCloseCircle color='#d3241a' size={15} />
                    </div>
                </Tooltip>

            }
        </div>

    );
}
// selectedItemsIds.includes(item.id)