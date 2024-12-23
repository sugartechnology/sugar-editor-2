import React from 'react';
import { GoPlus } from "react-icons/go";
import Tooltip from '@mui/material/Tooltip';
export default function ({
    onClickButton,
    tooltip,
    margin
}) {
    return (
        <Tooltip title={tooltip}>
            <div id="addProductPart" style={{ margin: margin && margin }} onClick={onClickButton}>
                <GoPlus />
            </div>
        </Tooltip>

    );
}
