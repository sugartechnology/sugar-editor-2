import * as Dockable from "@hlorenzi/react-dockable";
import React, { useEffect, useRef, useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import Select from "react-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api } from "../api/Api";
import { useProductContext } from "../context/ProductContext.jsx";


function ProductDetail() {
  const ctx = Dockable.useContentContext();
  ctx.setTitle( "ProducDetail" );

  const { productName, productId, setProductName } = useProductContext();

  const [isLoading, setIsLoading] = useState( false );
  const [productNameInput, setProductNameInput] = React.useState( productName );
  const [productCategory, setProductCategory] = React.useState( [] );
  const [productCompany, setProductCompany] = React.useState( null );
  const [productGlobalCategory, setProductGloabalCategory] = React.useState( [] );
  const [companies, setCompanies] = useState( [] );
  const [categories, setCategories] = useState( [] );
  const [globalCategories, setGlobalCategories] = useState( [] );

  const inputref = useRef( null );

  useEffect( () => {
    inputref.current.addEventListener( 'keydown', function ( event ) {
      event.stopPropagation();
    } );
  }, [] );

  window.editor.signals.sugarModelAdded.add( ( object ) => {
    if ( !object ) {
      setProductCompany( "" );
      setProductCategory( [] );
      setProductGloabalCategory( [] );
    }
  } );


  async function getProductInfo( id ) {
    if ( id ) {
      setIsLoading( true );
      Api.fetchProductInfo( id ).then( ( response ) => {
        setProductNameInput( response.name );
        setProductName( response.name );
        setProductCompany( {
          value: response.company.id,
          label: response.company.name
        } );
        response.category.map( ( item ) => {
          setProductCategory( ( prev ) => [...prev, {
            value: item.id,
            label: item.name
          }] );
        } );
        response.globalCategory.map( ( item ) => {
          setProductGloabalCategory( ( prev ) => [...prev, {
            value: item.id,
            label: item.name
          }] );
        } );
      } ).catch( ( err ) => console.error( err ) ).finally( () => setIsLoading( false ) );
    }
  }


  async function getCategories() {
    await Api.fetchCategoryList().then( ( response ) => {

      response.map( ( category ) => {
        setCategories( ( prev ) => [...prev, {
          value: category.id,
          label: `${category.application.name} - ${category.name}`
        }] );
      } );
    } ).catch( ( err ) => console.error( err ) );
  }

  async function getCompanies() {
    await Api.fetchCompanies().then( ( response ) => {
      response.map( ( company ) => {
        setCompanies( ( prev ) => [...prev, {
          value: company.id,
          label: company.name
        }] );
      } );
    } ).catch( ( err ) => console.error( err ) );
  }

  async function getGlobalCategories() {
    await Api.fetchGlobalCategories().then( ( response ) => {
      response.map( ( category ) => {
        setGlobalCategories( ( prev ) => [...prev, {
          value: category.id,
          label: category.name
        }] );
      } );
    } ).catch( ( err ) => console.error( err ) );
  }


  useEffect( () => {
    getCategories();
    getCompanies();
    getGlobalCategories();
  }, [] );

  useEffect( () => {
    if ( !productId ) return;
    getProductInfo( productId );
  }, [productId] );


  /**
   * 
   * @param {{value: number, label: string}} category
   * @returns 
   */
  const categoryFilter = ( category ) => {
    return category.label?.startsWith(productCompany?.label?.split( " " )[0]);
  };


  const customStyles = {
    option: ( defaultStyles, state ) => ( {
      ...defaultStyles,
      color: state.isSelected ? "#212529" : "#fff",
      backgroundColor: state.isSelected ? "#a0a0a0" : "#212529",
      maxHeight: "40px"
    } ),
    control: ( defaultStyles ) => ( {
      ...defaultStyles,
      backgroundColor: "#222",
      border: "none",
      boxShadow: "none",
    } ),
    singleValue: ( defaultStyles ) => ( { ...defaultStyles, color: "#888" } ),
  };

  if ( document.getElementById( "input" ) )
    document.getElementById( "input" ).addEventListener( 'keydown', function ( event ) {
      event.stopPropagation();
    } );


  const successMessage = () => toast.success( 'Product updated successfully!', {
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
  } );

  const errorMessage = () => toast.error( 'Error while update products', {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    // transition: "Bounce",
  } );

  async function onUpdateProduct() {
    try {
      setIsLoading( true );
      const categories = productCategory.map( item => item.value );
      const globalCategories = productGlobalCategory.map( item => item.value );
      const response = await Api.updateProduct( productId, productNameInput, productCompany.value, categories, globalCategories );
      if ( response == 200 )
        successMessage();


    } catch ( err ) {
      console.error( err );
      errorMessage();
    } finally {
      setIsLoading( false );
    }
  }


  if ( isLoading )
    return (
      <div style={{
        display: "flex", alignItems: "start", justifyContent: "center", height: "100%", paddingTop: "20px"
      }}>
        <ThreeDot color="#828d8a" size="medium" text="" textColor="#925959" />
      </div>
    );

  return (
    <div id="inputs" ref={inputref}>
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
      <span>SugarTechnology</span>

      <div id="inputContainer">
        <input id="input" type="text" value={productNameInput} onChange={( e ) => setProductNameInput( e.target.value )} placeholder={"Product Name"} />
      </div>
      <div id="selectContainer">
        <Select
          defaultValue={productCompany}
          onChange={setProductCompany}
          options={companies}
          placeholder="Select Company"
          id="select"
          styles={customStyles}
        />
        <Select
          defaultValue={productCategory}
          onChange={setProductCategory}
          options={categories.filter( categoryFilter )}
          placeholder="Select Category"
          id="select"
          isMulti
          styles={customStyles}
        />
        <Select
          defaultValue={productGlobalCategory}
          onChange={setProductGloabalCategory}
          options={globalCategories}
          isMulti
          placeholder="Select Global Category"
          id="select"
          styles={customStyles}
        />
      </div>

      <div onClick={() => {
        onUpdateProduct();
      }} id="searchButton">Save</div>


    </div>
  );
}


export default ProductDetail;
