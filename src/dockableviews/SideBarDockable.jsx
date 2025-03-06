import * as Dockable from "@hlorenzi/react-dockable";
import React from "react";
import { Sidebar } from "../editor/js/Sidebar.js";

function SidebarDockable() {
  const ctx = Dockable.useContentContext();
  ctx.setTitle("Scene");
  const ref = React.useRef();

  React.useEffect(() => {
    window.editor.signals.windowResize.add(function () {
      const bound = ref.current.parentElement.getBoundingClientRect();

      ref.current.children[0].children[1].children[0].children[0].children[1].style.height =
        bound.height / 2 + "px";
      ref.current.children[0].children[1].children[0].children[0].children[1].style.paddingBottom =
        "50px";
      ref.current.children[0].children[1].children[0].children[0].children[1].style.overflow =
        "scroll";
    });
    ref.current.appendChild(Sidebar(window.editor).dom);
  }, []);
  return <div ref={ref}></div>;
}

export default SidebarDockable;
