import { UIButton, UIDiv, UIInput, UIPanel, UIText } from "./libs/ui.js";

function LoginScreen(editor) {

    const config = editor.config;


    const container = new UIDiv();

    container.setId("login");
    container.setPosition('absolute');

    container
        .add(new UIText("Login"))
        .add(new UIInput("", "Email", "email").setClass("email"))
        .add(new UIInput("", "Password", "password").setClass("password"));

    const button = new UIButton("Submit");
    button.onClick(() => {
        const email = document.getElementsByClassName("email")[0].value;
        const password = document.getElementsByClassName("password")[0].value;
        console.log("email: ", email, " password: ", password);
    });

    container.add(button);

    return container;

}

export { LoginScreen };