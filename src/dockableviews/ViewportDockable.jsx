import * as Dockable from "@hlorenzi/react-dockable";
import React, { useEffect, useState } from "react";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function ViewportDockable({ viewDomElement }) {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("Viewport");
    // const [productName, setProductName] = useState("");

    const ref = React.useRef();

    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // window.editor.signals.objectSelected.add((object) => {
    //     setProductName(object.model.name);
    // });


    useEffect(() => {
        // console.log(viewDomElement);

        viewDomElement.style.position = undefined;
        viewDomElement.style.width = "100%";
        viewDomElement.style.height = "100%";
        resizeObserver.observe(viewDomElement);

        ref.current.appendChild(viewDomElement);

    }, [viewDomElement]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsLoading(true);
            setLoadingProgress(0);
            const modelData = JSON.parse(e.dataTransfer.getData("application/json"));

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            dracoLoader.setDecoderConfig({ type: 'js' });

            const loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);

            loader.load(modelData.url, (gltf) => {
                const model = gltf.scene;

                model.model = {
                    name: modelData.name,
                    id: modelData.id
                };

                window.editor.addObject(model);

                window.editor.signals.sceneGraphChanged.dispatch();

                dracoLoader.dispose();
                setIsLoading(false);
            },
                (xhr) => {
                    const progress = Math.round((xhr.loaded / xhr.total) * 100);
                    setLoadingProgress(progress);
                },
                (error) => {
                    console.error('Model yüklenirken hata oluştu:', error);
                    dracoLoader.dispose();
                    setIsLoading(false);
                });

        } catch (error) {
            console.error("Model yüklenirken hata oluştu:", error);
            setIsLoading(false);
        }
    };

    return <div
        ref={ref}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ width: '100%', height: '100%', position: 'relative' }}
    >
        {isLoading && (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '20px',
                borderRadius: '8px',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                zIndex: 1000
            }}>
                <div>Model Yükleniyor...</div>
                <div style={{
                    width: '200px',
                    height: '4px',
                    backgroundColor: '#333',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${loadingProgress}%`,
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                <div>%{loadingProgress}</div>
            </div>
        )}
        {/* <div id="productNameViewport">{productName && productName}</div> */}
    </div>;
}


export default ViewportDockable;

window.addEventListener("resize", () => {
    window.editor.signals.windowResize.dispatch();
});

setTimeout(() => {
    window.editor.signals.windowResize.dispatch();
}, 1000);


const resizeObserver = new ResizeObserver(() => {
    window.editor.signals.windowResize.dispatch();
});
