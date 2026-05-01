/**
 * Main visualization file.
 * Handles data loading, phase logic (organizeEdges, determineNodeActiveStatus),
 * and initVis -> updateVis -> renderVis
 * 
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

let IR_data;

async function loadData() {
    IR_data = await d3.json("../toy-datasets/IR/ir-after-spring-break.json");
    console.log("loaded the data", IR_data);
    return IR_data;
}

async function initVis() {
    let vis = this;

    vis.data = await loadData();

    vis.filter = "none";
    vis.tooltipPadding = 15;
    vis.phases = [];
    vis.phaseIDs = [];
    getPhases();

    //Set vis.filter equal to the last phase of optimization to show the graph after the end of optimization
    vis.filter = Number(vis.phaseIDs[vis.phases.length - 1]);

    vis.nodes = vis.data.nodes;
    vis.nodeEdges = organizeEdges();
    vis.activeNodesByPhase = determineNodeActiveStatus();

    createButtons();  // buttons.js
    updateVis();
}

function updateVis() {
    let vis = this;

    if (vis.filter != "none") {
        vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);

        const phaseEdges = [];
        vis.nodes.forEach(node => {
            if (!vis.phaseNodes.has(node.id)) return;

            const phaseDictionary = vis.nodeEdges.get(node.id);
            let activeEdges = null;

            const phases = Array.from(phaseDictionary.keys())
                .map(Number)
                .sort((a, b) => a - b);

            for (const p of phases) {
                if (p <= vis.filter) activeEdges = phaseDictionary.get(p);
                else break;
            }

            if (activeEdges === null) activeEdges = node.initialEdges;

            activeEdges.forEach(targetNode => {
                if (targetNode === -1) return;
                if (!vis.phaseNodes.has(targetNode)) return;
                phaseEdges.push([node.id, targetNode]);
            });
        });

        vis.links = phaseEdges.map(([s, t]) => ({ source: s, target: t, type: "basic" }));

    } else {
        vis.links = [];
        vis.nodes.forEach(node => {
            node.edges.forEach(targetNode => {
                if (targetNode !== -1) vis.links.push({ source: node.id, target: targetNode, type: "basic" });
            });
        });
    }

    renderVis();  // forcedirected.js
}

function organizeEdges() {
    let vis = this;

    const nodeEdges = new Map();

    vis.nodes.forEach(node => {

        const phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary);

        const node_removed = Array.from(Object.entries(node.removed));
        const node_replaced = Array.from(Object.entries(node.replaced));
        node_instructions = node.instAccess;

        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        var edge_relevant_instructions = [];

        for (const instruction of node_removed) {
            edge_relevant_instructions.push(instruction);
        }

        for (const instruction of node_replaced) {
            edge_relevant_instructions.push(instruction);
        }

        edge_relevant_instructions.sort((a, b) => Number(a[0]) - Number(b[0]));

        var phaseNumber = 0;
        var phaseID = 0;

        while (first_instruction_phase > Number(vis.phaseIDs[phaseID])) {
            phaseDictionary.set(Number(vis.phaseIDs[phaseID]), []);
            phaseID += 1;
        }

        edge_relevant_instructions.forEach(instruction => {

            const instructionID = instruction[0];
            const instructionPhase = node_instructions[instructionID].phaseFnId;

            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                if (Number(vis.phaseIDs[phaseID]) == first_instruction_phase &&
                    !(Array.from(phaseDictionary.keys()).includes(first_instruction_phase))) {
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), node.initialEdges);
                }

                while (Number(vis.phaseIDs[phaseID]) < instructionPhase) {
                    phaseID += 1;
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseID - 1]).slice());
                }
            }

            if (node_replaced.length != 0) {
                if (node_replaced.includes(instruction)) {
                    const replacedEntry = node_replaced.find(([key]) => key === instructionID.toString());
                    if (replacedEntry) {
                        var instruction = replacedEntry[1];
                        var edgePosition = instruction.position;
                        var newValue = instruction.to;
                        var edges = phaseDictionary.get(instructionPhase).slice();
                        edges[edgePosition] = newValue;
                        phaseDictionary.set(instructionPhase, edges);
                    }
                }
            }

            if (node_removed.length != 0) {
                if (node_removed.includes(instruction)) {
                    const removedEntry = node_removed.find(([key]) => key === instructionID.toString());
                    if (removedEntry) {
                        var instruction = removedEntry[1];
                        var removedNode = instruction.nodeId;
                        var edges = phaseDictionary.get(instructionPhase);
                        edges.splice(edges.indexOf(removedNode), 1);
                        phaseDictionary.set(instructionPhase, edges);
                    }
                }
            }
        });

        if (edge_relevant_instructions.length == 0) {

            phaseNumber = 0;
            phaseDictionary.set(first_instruction_phase, node.initialEdges);

            vis.phaseIDs.forEach(phase => {
                phase = Number(phase);
                if (!(Array.from(phaseDictionary.keys()).includes(phase))) {
                    if (phase < first_instruction_phase) {
                        phaseDictionary.set(Number(phase), []);
                    } else {
                        phaseDictionary.set(Number(phase), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber - 1]));
                    }
                }
                phaseNumber += 1;
            });

        } else {

            for (let i = 0; i < vis.phaseIDs.length; i++) {
                phaseKeys = Array.from(phaseDictionary.keys());
                if (!(phaseKeys.includes(Number(vis.phaseIDs[i])))) {
                    phaseDictionary.set(Number(vis.phaseIDs[i]), phaseDictionary.get(phaseKeys[i - 1]));
                }
            }
        }
    });

    return nodeEdges;
}

function determineNodeActiveStatus() {
    let vis = this;

    const CREATE = 7;
    const KILL = 3;

    const activeNodesByPhase = new Map();
    const alive = new Set();
    const phases = vis.phaseIDs.map(Number).sort((a, b) => a - b);

    for (const phase of phases) {
        activeNodesByPhase.set(phase, new Set());
    }

    for (const phase of phases) {
        vis.nodes.forEach(node => {
            for (const [instId, rec] of Object.entries(node.instAccess || {})) {
                if (Number(rec.phaseFnId) === phase) {
                    if (rec.type === CREATE) alive.add(node.id);
                    if (rec.type === KILL) alive.delete(node.id);
                }
            }
        });
        activeNodesByPhase.set(phase, new Set(alive));
    }

    return activeNodesByPhase;
}

function getPhases() {
    let vis = this;

    const functionIds = Object.entries(vis.data["fnId2Name"]);

    functionIds.forEach(functionId => {
        if (functionId[1].includes("Phase::Run")) {
            vis.phaseIDs.push(functionId[0]);
            vis.phases.push(functionId[1]);
        }
    });
}

initVis();