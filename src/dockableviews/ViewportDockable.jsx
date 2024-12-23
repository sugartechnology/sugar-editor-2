import * as Dockable from "@hlorenzi/react-dockable";
import React, { useEffect } from "react";

function ViewportDockable({ viewDomElement }) {
    const ctx = Dockable.useContentContext();
    ctx.setTitle("Viewport");

    const ref = React.useRef();

    // window.editor.signals.objectSelected.add((object) => {
    //     setProductName(object.model.name);
    // });


    useEffect(() => {
        viewDomElement.style.position = undefined;
        viewDomElement.style.width = "100%";
        viewDomElement.style.height = "100%";
        resizeObserver.observe(viewDomElement);

        ref.current.appendChild(viewDomElement);

    }, [viewDomElement]);

    return <div ref={ref}></div>;
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
