import React, { useEffect, useState } from "react";

import * as ReactDOM from "react-dom";

import * as Dockable from "@hlorenzi/react-dockable";
import { CiLogout } from "react-icons/ci";
import { FaCube } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { MdClose } from "react-icons/md";
import { RiMenuFold2Fill } from "react-icons/ri";
import { ProductProvider, useProductContext } from "./context/ProductContext.jsx";
import MaterialGroupsList from "./dockableviews/MaterialGroupsList.jsx";
import ProductDetail from "./dockableviews/ProductDetail.jsx";
import ProductList from "./dockableviews/ProductList.jsx";
import ProductPartGroups from "./dockableviews/ProductPartGroups.jsx";
import SidebarDockable from "./dockableviews/SideBarDockable.jsx";
import ViewportDockable from "./dockableviews/ViewportDockable.jsx";
import { Editor } from "./editor/js/Editor.js";
import { Viewport } from "./editor/js/Viewport.js";
import LoginScreen from "./LoginScreen.jsx";
import ModelRenders from "./dockableviews/ModelRenders.jsx";
function App({ viewDomElement }) {

  const [isAuth, setIsAuth] = useState(localStorage.getItem("auth"));

  let previousProductName = null;
  let previousProductId = null;

  const { setProductId, setProductName, productId } = useProductContext();



  useEffect(() => {
    window.editor.signals.sugarModelAdded.add((object) => {
      if (object.model) {
        const newProductName = object.model.name;
        const newProductId = object.model.id;

        if (previousProductName !== newProductName) {
          previousProductName = newProductName;
          setProductName(newProductName);
        }

        if (previousProductId !== newProductId) {
          previousProductId = newProductId;
          setProductId(newProductId);
        }
      } else {
        setProductName("");
        setProductId("");
      }
    });
  }, []);




  const dockState = Dockable.useDockable((state) => {
    Dockable.createDockedPanel(
      state,
      state.rootPanel,
      Dockable.DockMode.Full,
      <ViewportDockable viewDomElement={viewDomElement} />
    );
    Dockable.createDockedPanel(
      state,
      state.rootPanel,
      Dockable.DockMode.Left,
      <ProductList />
    );
    Dockable.createDockedPanel(
      state,
      state.rootPanel,
      Dockable.DockMode.Right,
      <SidebarDockable />
    );
  });

  async function handleLogout() {
    await localStorage.setItem("auth", "");
    setIsAuth(false);
  }

  if (!isAuth)
    return <LoginScreen setIsAuth={setIsAuth} />;


  return (
    <div id="app">
      <Menu dockState={dockState} handleLogout={handleLogout} />
      <div
        style={{
          width: "100vw",
          height: "95vh",
          position: "relative"
        }}
      >
        <Dockable.Container state={dockState} />
      </div>
    </div >


  );
}

function touchHandler(event) {
  var touches = event.changedTouches,
    first = touches[0],
    type = "";
  switch (event.type) {
    case "touchstart": type = "mousedown"; break;
    case "touchmove": type = "mousemove"; break;
    case "touchend": type = "mouseup"; break;
    default: return;
  }


  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1,
    first.screenX, first.screenY,
    first.clientX, first.clientY, false,
    false, false, false, 0/*left*/, null);

  first.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
}

function init() {
  document.addEventListener("touchstart", touchHandler, true);
  document.addEventListener("touchmove", touchHandler, true);
  document.addEventListener("touchend", touchHandler, true);
  document.addEventListener("touchcancel", touchHandler, true);
}

init();



window.addEventListener("load", () => {

  window.editor = new Editor();
  const viewDomElement = Viewport(window.editor).dom;



  ReactDOM.render(
    <ProductProvider>
      <App viewDomElement={viewDomElement} />
    </ProductProvider>
    , document.getElementById("root"));

});



function Menu({ dockState, handleLogout }) {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="dockableMenu">

      <div id="productSearchIcon" onClick={() => setIsOpen(!isOpen)}>
        <RiMenuFold2Fill color="#888" size={25} />
      </div>

      <div id="sugarTitle"> <FaCube />{"<Sugar-Model-Viewer>"}</div>
      <div id="dockableMenuOpen" style={{ width: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0, zIndex: isOpen ? 3 : -1 }}>
        <div id="closeMenuIcon" onClick={() => setIsOpen(!isOpen)}>
          <MdClose color="#888" size={25} />
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <ProductDetail />
            );
          }}>
          <GoPlus />
          ProductDetail
        </div>

        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <ProductList />
            );
          }}>
          <GoPlus />
          ProductList
        </div>

        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <ProductPartGroups dockState={dockState} />
            );
          }}>
          <GoPlus />
          Product Part Groups
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <MaterialGroupsList dockState={dockState} />
            );
          }}>
          <GoPlus />
          Material Groups
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <ViewportDockable viewDomElement={viewDomElement} />
            );
          }}>
          <GoPlus />
          Viewport
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <SidebarDockable />,
            );
          }} >
          <GoPlus />
          Scene
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => {
            setIsOpen(false);
            Dockable.spawnFloating(
              dockState,
              <ModelRenders />,
            );
          }} >
          <GoPlus />
          Models
        </div>
        <div
          id="dockableMenuOptions"
          onClick={() => handleLogout()} >
          <CiLogout />
          Log out
        </div>
      </div>


    </div>
  );
}
