
"use strict";

/* =========================================
   KRIISIPLAAN – SCRIPT.JS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Elements
    const householdModal = document.getElementById("household-modal");
    const householdButton = document.getElementById("household-button");
    const plannerForm = document.getElementById("planner-form");

    const resultsModal = document.getElementById("results-modal");
    const resultsContent = document.getElementById("results-content");

    // Run planner code only on the planner page
    if (!plannerForm) return;

    const getElement = (id) => document.getElementById(id);

    const getValue = (id) => Number(getElement(id).value);

    const formatNumber = (number) =>
        number.toLocaleString("et-EE");


    /* =====================================
       COUNTERS
    ===================================== */

    function setupCounter(name, minimum = 0) {

        const input = getElement(name);
        const plusButton = getElement(`${name}-plus`);
        const minusButton = getElement(`${name}-minus`);

        if (!input || !plusButton || !minusButton) return;

        plusButton.addEventListener("click", () => {
            input.value = Math.max(
                minimum,
                getValue(name) + 1
            );
        });

        minusButton.addEventListener("click", () => {
            input.value = Math.max(
                minimum,
                getValue(name) - 1
            );
        });

        input.addEventListener("change", () => {
            const value = Number(input.value);

            input.value = Number.isInteger(value)
                ? Math.max(minimum, value)
                : minimum;
        });
    }

    // Household counters
    setupCounter("adults");
    setupCounter("children");
    setupCounter("pets");

    // Days must be at least 1
    setupCounter("days", 1);


/* =====================================
   HOUSEHOLD MODAL
===================================== */

if (householdModal && householdButton) {

    let previousHousehold = {};

    householdButton.addEventListener("click", () => {

        previousHousehold = {
            adults: getValue("adults"),
            children: getValue("children"),
            pets: getValue("pets")
        };

        householdModal.returnValue = "";
        householdModal.showModal();
    });

    // Confirm selection
    getElement("household-confirm").addEventListener("click", () => {

        const adults = getValue("adults");
        const children = getValue("children");
        const pets = getValue("pets");

        getElement("people").value = adults + children;

        householdButton.textContent =
            `${adults} täiskasvanut, ` +
            `${children} last, ` +
            `${pets} lemmiklooma`;

        householdModal.close("confirm");
    });

    // Cancel selection
    getElement("household-cancel").addEventListener("click", () => {
        householdModal.close("cancel");
    });

    // Restore values when cancelled
    householdModal.addEventListener("close", () => {

        if (householdModal.returnValue === "confirm") return;

        getElement("adults").value = previousHousehold.adults;
        getElement("children").value = previousHousehold.children;
        getElement("pets").value = previousHousehold.pets;
    });
}
    /* =====================================
       CRISIS PLAN CALCULATION
    ===================================== */

    function calculatePlan(adults, children, days) {

        const portionsPerDay = 3;

        const adultPortions =
            adults * portionsPerDay * days;

        const childPortions =
            children * portionsPerDay * days;

        const totalPortions =
            adultPortions + childPortions;

        return {
            adultPortions,
            childPortions,
            totalPortions
        };
    }


    /* =====================================
       CREATE PRINTABLE RESULT
    ===================================== */

    function createPlanHTML(data) {

        const {
            adults,
            children,
            pets,
            days,
            crisis,
            adultPortions,
            childPortions,
            totalPortions
        } = data;

        return `
            <div class="plan-summary">

                <p>
                    <strong>Kriisitüüp:</strong>
                    ${crisis}
                </p>

                <p>
                    <strong>Ajavahemik:</strong>
                    ${formatNumber(days)} päeva
                </p>

                <p>
                    <strong>Täiskasvanuid:</strong>
                    ${formatNumber(adults)}
                </p>

                <p>
                    <strong>Lapsi:</strong>
                    ${formatNumber(children)}
                </p>

                <p>
                    <strong>Lemmikloomi:</strong>
                    ${formatNumber(pets)}
                </p>

            </div>

            <h3>Toiduvarud</h3>

            <table class="plan-table">

                <thead>
                    <tr>
                        <th>Leibkonna liige</th>
                        <th>Portsjonid</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Täiskasvanud</td>
                        <td>${formatNumber(adultPortions)}</td>
                    </tr>

                    <tr>
                        <td>Lapsed</td>
                        <td>${formatNumber(childPortions)}</td>
                    </tr>

                    <tr class="total-row">
                        <td>Kokku</td>
                        <td>${formatNumber(totalPortions)}</td>
                    </tr>
                </tbody>

            </table>

            ${
                pets > 0
                    ? `
                        <div class="pet-reminder">
                            🐾 Ära unusta varuda
                            lemmikloomadele toitu
                            ja joogivett!
                        </div>
                    `
                    : ""
            }

            <p class="plan-note">
                Arvutus põhineb kolmel portsjonil
                inimese kohta päevas.
                Tegelik toiduvajadus sõltub
                inimese vanusest, tervisest
                ja toitumisvajadustest.
            </p>
        `;
    }


    /* =====================================
       FORM SUBMISSION
    ===================================== */

    if (resultsModal && resultsContent) {

        plannerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const adults = getValue("adults");
            const children = getValue("children");
            const pets = getValue("pets");
            const days = getValue("days");

            const crisisSelect = getElement("crisis");

            // Validate household and days
            if (
                ![adults, children, pets, days]
                    .every(Number.isInteger) ||
                adults < 0 ||
                children < 0 ||
                pets < 0 ||
                days < 1
            ) {
                alert("Palun kontrolli sisestatud andmeid.");
                return;
            }

            if (adults + children === 0) {
                alert("Lisa leibkonda vähemalt üks inimene.");
                return;
            }

            if (!crisisSelect.value) {
                alert("Palun vali kriisitüüp.");
                return;
            }

            // Get selected crisis from the fixed option list
            const crisisNames = {
                elektrikatkestus: "Elektrikatkestus",
                veekatkestus: "Veekatkestus",
                torm: "Torm",
                uleujutus: "Üleujutus",
                tulekahju: "Tulekahju",
                evakuatsioon: "Evakuatsioon",
                muu: "Muu kriis"
            };

            const crisis = crisisNames[crisisSelect.value];

            if (!crisis) {
                alert("Tundmatu kriisitüüp.");
                return;
            }

            // Calculate food portions
            const calculation =
                calculatePlan(adults, children, days);

            const planData = {
                adults,
                children,
                pets,
                days,
                crisis,
                ...calculation
            };

            // Insert result into modal
            resultsContent.innerHTML =
                createPlanHTML(planData);

            // Open modal
            resultsModal.showModal();
        });


        /* =====================================
           RESULT MODAL BUTTONS
        ===================================== */

        const closeButton = getElement("close-results");
        const printButton = getElement("print-plan");

        if (closeButton) {
            closeButton.addEventListener("click", () => {
                resultsModal.close();
            });
        }

        if (printButton) {
            printButton.addEventListener("click", () => {
                window.print();
            });
        }
    }

});
