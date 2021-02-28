export function registerDraggable(element: HTMLElement) {
    let dragging = false;
    let pos: [number, number] = [0, 0];
    element.addEventListener("mousedown", (e) => {
        dragging = true;
        pos = [e.clientX, e.clientY];
    });
    document.addEventListener("mouseup", (e) => {
        dragging = false;
    });
    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        e.preventDefault();
        element.style.top = (element.offsetTop - (pos[1] - e.clientY)) + "px";
        element.style.left = (element.offsetLeft - (pos[0] - e.clientX)) + "px";
        pos = [e.clientX, e.clientY];
    });
};

const elements = document.getElementsByClassName("draggable");
for (let i = 0; i < elements.length; ++i)
    registerDraggable(elements[i] as HTMLElement);
