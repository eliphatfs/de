class DialogBuilder {
    dialog: HTMLElement
    head: HTMLElement
    constructor() {
        this.dialog = document.createElement("div");
        this.dialog.style.position = "fixed";
        this.dialog.style.left = this.dialog.style.top = "50%";
        this.dialog.style.transform = "translate(-50%, -50%)";
        this.dialog.style.backgroundColor = "#ffffff";
        this.dialog.style.boxShadow = "0.0em 0.3em 0.5em rgba(0, 0, 0, 0.2)";
        this.dialog.style.padding = "0.3em";
        this.head = this.dialog;
    }

    row() {
        let r = document.createElement("div");
        this.dialog.appendChild(r);
        this.head = r;
        return this;
    }

    button(text: string, action: (dialog: HTMLElement) => void) {
        let btn = document.createElement("button");
        btn.innerHTML = text;
        btn.className = "pure-button";
        btn.onclick = () => action(this.dialog);
        this.head.appendChild(btn);
        return this;
    }

    show(parent?: Node) {
        (parent ?? document.body).appendChild(this.dialog);
        return this;
    }
}

export default DialogBuilder;
