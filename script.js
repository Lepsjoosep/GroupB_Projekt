const modal = document.getElementById("household-modal");
const openButton = document.getElementById("household-button");

openButton.addEventListener("click", () => {
    modal.showModal();
});

function setupCounter(name) {
    const input = document.getElementById(name);

    document.getElementById(`${name}-plus`)
        .addEventListener("click", () => {
            input.value = Number(input.value) + 1;
        });

    document.getElementById(`${name}-minus`)
        .addEventListener("click", () => {
            input.value = Math.max(0, Number(input.value) - 1);
        });
}

setupCounter("adults");
setupCounter("children");
setupCounter("pets");

document.getElementById("household-confirm")
    .addEventListener("click", () => {
        const adults = Number(document.getElementById("adults").value);
        const children = Number(document.getElementById("children").value);
        const pets = Number(document.getElementById("pets").value);

        document.getElementById("people").value = adults + children;
        openButton.textContent = `${adults} täiskasvanut, ${children} last, ${pets} lemmiklooma`;

        modal.close();
    });

document.getElementById("household-cancel")
    .addEventListener("click", () => modal.close());