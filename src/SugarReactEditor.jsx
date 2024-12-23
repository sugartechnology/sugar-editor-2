import React, { useEffect, useState } from "react";

import * as ReactDOM from "react-dom";

import * as Dockable from "@hlorenzi/react-dockable";
import { CiLogout } from "react-icons/ci";
import { FaCube } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { MdClose } from "react-icons/md";
import { RiMenuFold2Fill } from "react-icons/ri";
import { Editor } from "../lib/threejs/editor/js/Editor.js";
import { Viewport } from "../lib/threejs/editor/js/Viewport.js";
import { ProductProvider, useProductContext } from "./context/ProductContext.jsx";
import MaterialGroupsList from "./dockableviews/MaterialGroupsList.jsx";
import ProductDetail from "./dockableviews/ProductDetail.jsx";
import ProductList from "./dockableviews/ProductList.jsx";
import ProductPartGroups from "./dockableviews/ProductPartGroups.jsx";
import SidebarDockable from "./dockableviews/SideBarDockable.jsx";
import ViewportDockable from "./dockableviews/ViewportDockable.jsx";
import LoginScreen from "./LoginScreen.jsx";

function App( { viewDomElement } ) {

  const [isAuth, setIsAuth] = useState( localStorage.getItem( "auth" ) );

  let previousProductName = null;
  let previousProductId = null;

  const { setProductId, setProductName, productId } = useProductContext();

  const views = [
    {
      name: "ProductDetail",
      component: <ProductDetail />
    },
    {
      name: "ProductList",
      component: <ProductList />
    },
    {
      name: "ProductPartGroups",
      component: <ProductPartGroups />
    },
    {
      name: "MaterialGroups",
      component: <MaterialGroupsList />
    },
    {
      name: "Viewport",
      component: <ViewportDockable viewDomElement={viewDomElement} />
    },
    {
      name: "Scene",
      component: <SidebarDockable />
    }
  ];

  useEffect( () => {
    window.editor.signals.sugarModelAdded.add( ( object ) => {
      if ( object.model ) {
        const newProductName = object.model.name;
        const newProductId = object.model.id;

        if ( previousProductName !== newProductName ) {
          previousProductName = newProductName;
          setProductName( newProductName );
        }

        if ( previousProductId !== newProductId ) {
          previousProductId = newProductId;
          setProductId( newProductId );
        }
      } else {
        setProductName( "" );
        setProductId( "" );
      }
    } );
  }, [] );

  const dockState = Dockable.useDockable( ( state ) => {
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
  } );

  function handleLogout() {
    localStorage.setItem( "auth", "" );
    setIsAuth( false );
  }

  if ( !isAuth )
    return <LoginScreen setIsAuth={setIsAuth} />;


  return (
    <div id="app">
      <Menu
        dockState={dockState}
        handleLogout={handleLogout}
        views={views} />
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

window.addEventListener( "load", () => {
  window.editor = new Editor();
  const viewDomElement = Viewport( window.editor ).dom;

  ReactDOM.render(
    <ProductProvider>
      <App viewDomElement={viewDomElement} />
    </ProductProvider>
    , document.getElementById( "root" ) );

} );

function Menu( { dockState, handleLogout, views } ) {

  const [isOpen, setIsOpen] = useState( false );

  return (
    <div id="dockableMenu">

      <div id="productSearchIcon" onClick={() => setIsOpen( !isOpen )}>
        <RiMenuFold2Fill color="#888" size={25} />
      </div>

      <div id="sugarTitle"> <FaCube />{"<Sugar-Model-Viewer>"}</div>
      <div id="dockableMenuOpen" style={{ width: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0, zIndex: isOpen ? 3 : -1 }}>
        <div id="closeMenuIcon" onClick={() => setIsOpen( !isOpen )}>
          <MdClose color="#888" size={25} />
        </div>
        {views.map( ( view ) => (
          <div
            class="dockableMenuOptions"
            onClick={() => {
              setIsOpen( false );
              Dockable.spawnFloating(
                dockState,
                view.component
              );
            }}>
            <GoPlus />
            {view.name}
          </div>
        ) )}
        <div
          class="dockableMenuOptions"
          onClick={() => handleLogout()} >
          <CiLogout />
          Log out
        </div>
      </div>


    </div>
  );
}
