/**
 * Phase selector buttons.
 * Called from initVis() in main.js after phases are loaded.
 * On click, updates vis.filter and calls updateVis() in main.js.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

function createButtons() {
    let vis = this;

    const buttonBox = document.getElementById("button-box");

    for (let i = 0; i < vis.phases.length; i++) {

        split_phase = vis.phases[i].split("::");
        const phaseName = (split_phase[3]);
        const phaseId = vis.phaseIDs[i];

        const btn = document.createElement("button");
        btn.textContent = "Phase " + phaseId + ": " + phaseName;
        btn.className = "phase_btn";

        if (i == vis.phases.length - 1) {

            btn.classList.add("selected");

        }

        buttonBox.appendChild(btn);

        btn.addEventListener("click", () => {

            document.querySelectorAll(".phase_btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            var phaseID = btn.textContent.split(" ")[1];
            // Remove ending colon
            phaseID = phaseID.substring(0, phaseID.length - 1);
            vis.filter = Number(phaseID);
            updateVis();  // main.js
        });
    }
}