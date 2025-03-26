import * as Dockable from "@hlorenzi/react-dockable";
import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ThreeDot } from "react-loading-indicators";
import Select from "react-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api } from "../api/Api.js";
import AddButton from "../components/AddButton.jsx";

function ModelRenders() {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("Models");
    const [searchText, setSearchText] = useState("");
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [modelName, setModelName] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploadAreaVisible, setIsUploadAreaVisible] = useState(false);
    const [models, setModels] = useState([]);
    const inputref = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);

    const statusOptions = [
        { value: "PENDING", label: "PENDING" },
        { value: "PROCESSING", label: "PROCESSING" },
        { value: "FAILED", label: "FAILED" },
        { value: "COMPLETED", label: "COMPLETED" }
    ];

    const customStyles = {
        option: (defaultStyles, state) => ({
            ...defaultStyles,
            color: state.isSelected ? "#212529" : "#fff",
            backgroundColor: state.isSelected ? "#a0a0a0" : "#212529",
            maxHeight: "30px"
        }),
        control: (defaultStyles) => ({
            ...defaultStyles,
            backgroundColor: "#222",
            border: "none",
            boxShadow: "none",
        }),
        singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#888" }),
        multiValue: (defaultStyles) => ({
            ...defaultStyles,
            backgroundColor: "#444",
        }),
        multiValueLabel: (defaultStyles) => ({
            ...defaultStyles,
            color: "#fff",
        }),
        multiValueRemove: (defaultStyles) => ({
            ...defaultStyles,
            color: "#fff",
            ':hover': {
                backgroundColor: "#666",
            },
        }),
    };

    const successMessage = () => toast.success('Model başarıyla yüklendi!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });

    const errorMessage = () => toast.error('Model yüklenirken bir hata oluştu', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });

    async function handleSearch() {
        try {
            const statusValues = selectedStatus.map(option => option.value);
            const res = await Api.getModels(statusValues, searchText);
            setModels(res);
        } catch (error) {
            console.error(error);
            toast.error('Modeller yüklenirken bir hata oluştu');
        }
    }

    useEffect(() => {
        inputref.current.addEventListener('keydown', function (event) {
            if (event.key != "Enter")
                event.stopPropagation();
        });

        handleSearch();

        const intervalId = setInterval(() => {
            handleSearch();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);

        previewUrls.forEach(url => URL.revokeObjectURL(url));

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    }

    async function handleUpload() {
        if (selectedFiles.length === 0 || !modelName) {
            toast.warning('Lütfen dosya(lar) ve model ismi giriniz', {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
            return;
        }

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append("sourceFile", file);
            });
            formData.append("name", modelName);
            const res = await Api.uploadModel(formData);
            if (res.ok) {
                successMessage();
                setSelectedFiles([]);
                setPreviewUrls([]);
                setModelName("");
                setIsUploadAreaVisible(false);
                handleSearch();
            } else {
                errorMessage();
            }
        } catch (error) {
            console.error(error);
            errorMessage();
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        setSelectedFiles(files);

        previewUrls.forEach(url => URL.revokeObjectURL(url));

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    }

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [previewUrls]);

    function handleRemoveFile(indexToRemove) {
        setSelectedFiles(prevFiles =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );

        setPreviewUrls(prevUrls => {
            URL.revokeObjectURL(prevUrls[indexToRemove]);
            return prevUrls.filter((_, index) => index !== indexToRemove);
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#111", position: "relative" }} ref={inputref}>
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
            <div style={{ alignSelf: "flex-end", padding: "5px" }}>
                <AddButton tooltip={"Upload Model"} onClickButton={() => setIsUploadAreaVisible(!isUploadAreaVisible)} />
            </div>
            {isUploadAreaVisible && (
                <div style={{ alignSelf: "center", padding: "5px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%" }}>
                    <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="Model İsmi"
                        style={{
                            padding: "2px",
                            borderRadius: "4px",
                            border: "1px solid #444",
                            backgroundColor: "#222",
                            color: "#fff",
                            width: "40%",
                            maxWidth: "200px"
                        }}
                    />
                    <div
                        onClick={() => document.getElementById('fileInput').click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            width: "200px",
                            height: "200px",
                            border: `2px dashed ${isDragging ? '#666' : '#444'}`,
                            borderRadius: "4px",
                            backgroundColor: "#222",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            color: "#666"
                        }}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            onChange={handleFileSelect}
                            accept=".jpg,.png,.jpeg,.stl,.obj"
                            multiple
                            style={{ display: 'none' }}
                        />
                        {selectedFiles.length > 0 ? (
                            <div style={{
                                textAlign: 'center',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                overflowY: 'auto'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                    gap: '5px',
                                    width: '100%',
                                    padding: '10px'
                                }}>
                                    {previewUrls.map((url, index) => (
                                        <div key={index} style={{
                                            position: 'relative',
                                            width: '80px',
                                            height: '80px'
                                        }}>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile(index);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#d42',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    zIndex: 2
                                                }}
                                            >
                                                ×
                                            </div>
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <div style={{
                                                color: '#888',
                                                fontSize: '10px',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {selectedFiles[index].name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div>Dosyaları sürükleyin</div>
                                <div style={{ marginTop: '5px' }}>veya</div>
                                <div style={{ marginTop: '5px' }}>tıklayıp seçin</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleUpload}
                        style={{
                            padding: "4px 12px",
                            borderRadius: "4px",
                            border: "1px solid #444",
                            backgroundColor: "#333",
                            color: "#fff",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            width: "40%",
                            alignSelf: "center",
                            maxWidth: "200px"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#444"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#333"}
                    >
                        Yükle
                    </button>
                </div>
            )}
            <div id='productSearch' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input id="input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={"Search.."}
                    onKeyDown={(e) => {
                        if (e.key === "Enter")
                            handleSearch();
                    }}
                    style={{
                        height: "28px"
                    }}
                />
                <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={statusOptions}
                    isMulti
                    placeholder="Select Status"
                    styles={customStyles}
                    className="status-select"
                />
                <div id='productSearchIcon' onClick={handleSearch}>
                    <FaSearch color='#888' />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '15px',
                padding: '15px',
                overflowY: 'auto'
            }}>
                {models.map((model) => (
                    <div
                        key={model.id}
                        draggable
                        onDragStart={(e) => {
                            const modelData = {
                                url: model.modelUrl,
                                name: model.name,
                                id: model.id
                            };
                            e.dataTransfer.setData("application/json", JSON.stringify(modelData));
                        }}
                        style={{
                            backgroundColor: '#222',
                            borderRadius: '6px',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                            alignItems: 'center',
                            cursor: 'grab'
                        }}
                    >
                        <img
                            src={model.thumbnailUrl}
                            alt={model.name}
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0
                            }}
                        />
                        <div style={{
                            flex: 1,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            color: '#fff',
                            fontSize: '14px'
                        }}>
                            {model.name}
                        </div>
                        <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            backgroundColor: model.status === 'COMPLETED' ? '#2d4' :
                                model.status === 'FAILED' ? '#d42' :
                                    model.status === 'PROCESSING' ? '#42d' : '#dd2',
                            color: '#fff',
                            flexShrink: 0
                        }}>
                            {model.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default ModelRenders;
