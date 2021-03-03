import { TokenFlags } from "typescript";

export class DialogBuilderDataDelegate {
    dialog: HTMLElement
    onCommit: (() => void)[]
    constructor(dialog: HTMLElement, onCommit: (() => void)[]) {
        this.dialog = dialog;
        this.onCommit = onCommit;
    }

    close() {
        this.dialog.remove();
    }

    commitFields() {
        for (let act of this.onCommit) act();
        return this;
    }
}

class DialogBuilder {
    dialog: HTMLElement
    head: HTMLElement
    onCommit: (() => void)[]
    constructor() {
        this.dialog = document.createElement("div");
        this.dialog.style.position = "fixed";
        this.dialog.style.left = this.dialog.style.top = "50%";
        this.dialog.style.transform = "translate(-50%, -50%)";
        this.dialog.style.backgroundColor = "#ffffff";
        this.dialog.style.boxShadow = "0.0em 0.3em 0.5em rgba(0, 0, 0, 0.2)";
        this.dialog.style.padding = "0.7em";
        this.head = this.dialog;
        this.onCommit = [];
    }

    rowDiv() {
        let r = document.createElement("div");
        this.dialog.appendChild(r);
        this.head = r;
        return this;
    }

    rowForm(options: { title?: string, compact?: boolean } = {}) {
        let f = document.createElement("form");
        let s = document.createElement("fieldset");
        f.appendChild(s);
        f.className = "pure-form";
        if (!options.compact) f.classList.add("pure-form-stacked");
        if (options.title) s.appendChild(document.createElement("legend")).innerHTML = options.title;
        this.head = s;
        this.dialog.appendChild(f);
        return this;
    }

    splitter(opacity: number = 0.2) {
        let hr = document.createElement("hr");
        hr.style.opacity = opacity.toString();
        this.dialog.appendChild(hr);
        this.head = this.dialog;
        return this;
    }

    button(text: string, action: (data: DialogBuilderDataDelegate) => void, options: {
        size?: number, primary?: boolean, color?: string, textColor?: string
    } = {}) {
        let {size, primary, textColor, color} = options;
        let btn = document.createElement("button");
        btn.innerHTML = text;
        btn.className = "pure-button";
        btn.style.fontSize = ((size ?? 0.8) * 100).toString() + "%";
        if (primary) btn.classList.add("pure-button-primary");
        if (color) btn.style.backgroundColor = color;
        if (textColor) btn.style.color = textColor;
        btn.onclick = () => action(new DialogBuilderDataDelegate(this.dialog, this.onCommit));
        this.head.appendChild(btn);
        return this;
    }

    space() {
        return this.span(" ");
    }

    span(text: string, ...extraClasses: string[]) {
        let spn = document.createElement("span");
        spn.innerHTML = text;
        for (let c of extraClasses) spn.classList.add(c);
        this.head.appendChild(spn);
        return this;
    }

    textInputField(options: {
        onCommit?: (contents: string) => void, onValidate?: (contents: string) => string | null, initial?: string, placeholder?: string, id?: string, label?: string
    })
    {
        let {onCommit, onValidate, initial, placeholder, id, label} = options;
        let tif = document.createElement("input");
        tif.type = "text";
        if (id) tif.id = id;
        if (placeholder) tif.placeholder = placeholder;
        if (initial) tif.value = initial;
        if (label) {
            let lab = document.createElement("label");
            if (!id) id = "dialog-builder-generated-" + Math.random().toString();
            lab.htmlFor = id;
            lab.innerHTML = label;
            this.head.appendChild(lab);
        }
        this.onCommit.push(() => { if(onCommit) onCommit(tif.value); });
        tif.onblur = () => {
            if (onValidate) {
                const val = onValidate(tif.value);
                if (val) tif.value = val;
            }
        }
        this.head.appendChild(tif);
        return this;
    }

    show(parent?: Node) {
        (parent ?? document.body).appendChild(this.dialog);
        return this;
    }
}

export default DialogBuilder;
