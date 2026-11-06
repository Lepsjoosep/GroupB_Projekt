
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

/* =====================================
   RESET PLANNER ON PAGE REFRESH
===================================== */

    window.addEventListener("pageshow", () => {

        // Leibkond
        const adults = document.getElementById("adults");
        const children = document.getElementById("children");
        const pets = document.getElementById("pets");
        const people = document.getElementById("people");
        const householdButton = document.getElementById("household-button");

        if (adults) adults.value = 1;
        if (children) children.value = 0;
        if (pets) pets.value = 0;
        if (people) people.value = 0;

        if (householdButton) {
            householdButton.textContent = "Vali leibkond";
        }

        // Ajavahemik
        const days = document.getElementById("days");

        if (days) {
            days.value = 1;
        }

        // Kriisitüüp
        const crisis = document.getElementById("crisis");

        if (crisis) {
            crisis.value = "";
        }
    });

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

        const electricityInstructions = `
    <section class="crisis-instructions">
        <h3>Mida teha elektrikatkestuse korral?</h3>

        <ul>
            <li>Lülita välja elektriseadmed.</li>

            <li>
                Kui võrguettevõte ei ole sind elektrikatkestusest
                teavitanud, teata sellest oma elektrienergia
                võrguteenuse pakkujale
                (<a href="https://www.olevalmis.ee/abinumbrid"
                    target="_blank"
                    rel="noopener noreferrer">vaata abinumbreid</a>).
            </li>

            <li>
                Kasuta alternatiivseid lahendusi kodu kütmiseks,
                vee kättesaamiseks, toidu valmistamiseks ja info
                saamiseks. Sooja hoidmiseks ole võimalusel
                mitmekesi ühes ruumis, hoia uksed ja aknad kinni.
            </li>

            <li>
                Hoidu külmkapi ja sügavkülmiku sagedasest
                avamisest, et toiduained säiliksid kauem.
            </li>

            <li>
                Aku- ja patareitoitel olevaid seadmeid,
                sealhulgas telefoni, kasuta säästlikult
                ja ainult vältimatu vajaduse korral.
                Telefonis lülita välja palju energiat
                vajavad rakendused.
            </li>

            <li>
                Kasuta alternatiivseid energiaallikaid
                (generaator, akud, patareid) säästlikult
                ja vaid vältimatu vajaduse korral.
                Nii pikendad nende tööaega.
            </li>

            <li>
                Kui sa ei saa elektrikatkestuse korral kodus
                ise ohutult hakkama, pöördu abi saamiseks
                kohaliku omavalitsuse poole.
            </li>
        </ul>
    </section>
`;
    const waterInstructions = `
    <section class="crisis-instructions">
        <h3>Mida teha veekatkestuse korral?</h3>

        <p>
            Kraani- või kaevuvee puudumine mõjutab oluliselt kogu igapäevaelu.
            Samas on joogivett lihtne varuda ja see säilib üsna kaua.
            Arvesta, et veekatkestuse puhul ei pruugi töötada ka kanalisatsioon
            ehk ei saa tavapäraselt kasutada tualettruumi.
            Kaardista probleemid, mis sinu kodus tekivad, kui vett ei ole.
            Kui sõltud ühisveevärgist, uuri korteriühistu, teenusepakkuja
            või kohaliku omavalitsuse kaudu, kuidas on tagatud elanike
            veega varustamine teenuse katkemise korral.
        </p>

        <h4>Joogivesi ja toidu valmistamine</h4>
        <ul>
            <li>Hoia kodus võimalusel 3 liitrit vett inimese kohta üheks ööpäevaks.</li>

            <li>Varu koju veepuhastustablette või veefiltreid.</li>

            <li>
                Looduslikust veekogust võetud veel lase settida, kurna pealmine,
                selgem veekiht läbi tiheda riide või kohvifiltri ning keeda
                intensiivselt mulisedes vähemalt 1 minut.
                Ka seisnud vett on soovitav keeta vähemalt 1 minut.
                Vee keetmine hävitab seal leiduvad mikroorganismid
                (bakterid, viirused, algloomad), kuid ei eemalda keemilist reostust.
            </li>

            <li>
                <a href="https://allikad.info/springs" target="_blank" rel="noopener noreferrer">
                    Vaata, kus on sinu lähimad puhta joogivee saamise võimalused
                </a>
                (kaev, allikas vmt) ning siseveekogud muu tarbevee võtmiseks.
            </li>

            <li>
                <a href="https://www.olevalmis.ee/assets/image/upload/q_auto/f_auto/c_limit,w_1920/v1/olevalmis-payload-live/koyyxtc9m1kc2uwvsii2"
                   target="_blank"
                   rel="noopener noreferrer">
                    Vaata näidet toidu valmistamisest veekatkestuse ajal
                </a>.
            </li>
        </ul>

        <h4>Tualeti kasutamine ja kanalisatsioon</h4>
        <ul>
            <li>Varu koju niiskeid puhastuslappe, desinfitseerimise vahendeid, prügikotte ja hügieenitarbeid.</li>

            <li>
                Kui kanalisatsiooniteenus katkeb, kasuta tualetina prügikotte.
                Soovitatav on lisada prügikotti ajalehti, saepuru, turvast
                või muud imavat materjali. Võimalusel kasuta kuivkäimlat.
            </li>

            <li>Kasuta jäätmete jaoks solgiämbrit.</li>
        </ul>

        <h4>Mida teha veekatkestuse ajal?</h4>
        <ul>
            <li>Kasuta vett säästlikult.</li>

            <li>Võimalusel lase veetorudesse jäänud vesi kraanidest anumatesse.</li>

            <li>
                Jälgi kohaliku omavalitsuse ametlikke teadaandeid elanike
                joogiveega varustamise kohta.
            </li>
        </ul>
    </section>
`;
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
            ${crisis === "Elektrikatkestus" ? electricityInstructions : ""}
            ${crisis === "Veekatkestus" ? waterInstructions : ""}
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
                veekatkestus: "Veekatkestus"
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
