import { UIButton, UIDiv, UITabbedPanelCustom, UIText } from "./libs/ui.js";
import { SidebarProperties } from './Sidebar.Properties.js';

function ProductMenu() {

    const container = new UITabbedPanelCustom();

    container.setId('sidebar-left');

    container.dom.addEventListener("mouseover", function () {
        container.dom.style.width = "350px";

    });
    container.dom.addEventListener("mouseleave", function () {
        container.dom.style.width = "40px";

    });



    const toggleButton = new UIButton("open").onClick(function () {
        const currentWidth = container.dom.style.width;
        console.log(toggleButton.dom.text);

        if (currentWidth === "40px")
            container.dom.style.width = "350px";
        else
            container.dom.style.width = "40px";

    });

    const sugarTitle = new UIText("SugarTechnology");

    container.add(sugarTitle);
    // container.add(toggleButton);




    return container;

}



export { ProductMenu };