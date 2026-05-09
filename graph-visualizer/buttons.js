/**
 * Phase selectction options.
 * Called from initVis() in main.js after phases are loaded.
 * 
 * Dynamically adds phases to the HTML select element with ID phaseDropDown.
 * 
 * Adds event listener to updateVisulization button.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

function fillSelectionBox() {
    let vis = this;

    const selectBox = document.getElementById("phaseDropDown");
    const selectButton = document.getElementById("phaseConfirmation");

    //Add event listener to our Update Visualization button (ID: phaseConfirmation) that retrieves the current
    //user selection and calls updateVis()
    selectButton.addEventListener("click", () => {

        vis.filter = Number(selectBox.value);
        updateVis();
        
    })

    //Add options for every single phase
    for (let i = 0; i < vis.phases.length; i++) {

        split_phase = vis.phases[i].split("::");
        const phaseName = (split_phase[3]);
        const phaseId = vis.phaseIDs[i];

        const phaseOption = new Option("Phase " + phaseId + ": " + phaseName, Number(phaseId));
        selectBox.add(phaseOption);

    }
}