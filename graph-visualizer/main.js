/**
 * Main visualization file.
 * Handles data loading, phase logic, and coordinates between
 * static (static.js) and force-directed (forcedirected.js) renderers.
 *
 * vis.links      → coordinate-based links used by static renderer
 * vis.fdLinks    → ID-based links used by force-directed renderer
 *
 * @author Ellora Devulapally, Taft Harrell
 */

let IR_data;
let currentVisualization = 'static'; // default view

// LOADING DATA 


/**
 * Load data and wait for it to load before calling any other functions
 * 
 * @returns the loaded data from the JSON
 */
async function loadData() {
    IR_data = await d3.json("../toy-datasets/IR/ir-after-spring-break.json");
    console.log("loaded the data", IR_data);
    return IR_data;
}

// INITIALIZE DATA
/**
 * Initializes the visualization by parsing through the data, getting all phases and phaseIDs, setting
 * initial phase to display, get all nodes and edges, and create options in the HTML select element.
 */
async function initVis() {
    let vis = this;

    vis.data = await loadData();

    vis.tooltipPadding = 15;
    vis.phases = [];
    vis.phaseIDs = [];
    getPhases();

    vis.filter = Number(vis.phaseIDs[0]);

    vis.nodes = vis.data.nodes;
    vis.nodeEdges = organizeEdges();
    vis.activeNodesByPhase = determineNodeActiveStatus();

    // vis.circles: fixed grid positions keyed by node array index.
    const radius = 35;
    const cols = 10;
    vis.circles = vis.nodes.map((node, i) => {
        const cx = (i * (radius * 2) + radius) % (cols * radius * 2);
        const cy = (2 * radius) * Math.floor(i / cols) + radius * 2;
        return { x: cx, y: cy };
    });

    // linkPath: used by static renderer to draw curved paths
    vis.linkPath = d3.linkHorizontal()
        .x(d => d.x)
        .y(d => d.y);

    fillSelectionBox();           // buttons.js
    setupVisualizationToggle();
    updateVis();
}

/**
 * A function that creates and updates the visualization toggle 
 * Allowing the user to switch between two (or more) different vis types
 */
function setupVisualizationToggle() {
    const toggleButton = document.getElementById("visTypeToggle");
    const currentVisLabel = document.getElementById("currentVisType");

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            currentVisualization = (currentVisualization === 'static') ? 'force-directed' : 'static';
            if (currentVisLabel) {
                currentVisLabel.textContent = currentVisualization === 'static' ? 'Static' : 'Force-Directed';
            }
            // Data hasn't changed, just re-render in the new mode
            renderVis();
        });
    }
}

// UPDATE VIS
/**
 * Sorts through nodes and edges, filtering based on the phase the user has selected.
 */
function updateVis() {
    let vis = this;

    vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);

    const phaseEdges = []; // [ [sourceId, targetId], ... ]

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

    // Format for static renderer: coordinate objects using vis.circles
    vis.links = phaseEdges.map(([s, t]) => ({
        source: vis.circles[s],
        target: vis.circles[t]
    }));

    // Format for force-directed renderer: node ID references + type
    vis.fdLinks = phaseEdges.map(([s, t]) => ({ source: s, target: t, type: "basic" }));

    renderVis();
}

    // Remove only the visual elements, not the defs
    vis.svg.selectAll("circle").remove();
    vis.svg.selectAll("text").remove();
    vis.svg.selectAll("path").remove();
    vis.svg.selectAll("polygon").remove();

    // Re-add the arrow marker definition (since it was removed)
    vis.svg.select("defs").remove(); // Remove old defs
    vis.svg.append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#ff0000");

    // Drawing circles out onto screen
    vis.svg.selectAll("circle")
        .data(vis.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", (d, i) => vis.circles[i].x)
        .attr("cy", (d, i) => vis.circles[i].y)
        .attr("r", radius) 
        .attr("fill", "#ADD8E6")
        .attr("opacity", (d) => {
            if (vis.filter == "none") {
                return 1;
            }
            else {
                if (vis.phaseNodes.has(d.id)) {
                    return 1;
                }
                else {
                    return 0.1;
                }
            }
        });

    //Add node IDs to visualized nodes
    vis.svg.selectAll("text")
        .data(vis.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d, i) => {
            if (d.id < 10) {
                return vis.circles[i].x - 5;
            }
            return vis.circles[i].x - 7;
        })
        .attr("y", (d, i) => vis.circles[i].y - 10)
        .attr("fill", "black")
        .style("font-size", "20px")
        .text(d => d.id);
    
    // Draw the paths with arrows (ONLY ONCE!)
    vis.svg.selectAll("path.edge")
        .data(vis.links)
        .enter()
        .append("path")
        .attr("class", "edge")
        .attr("d", vis.linkPath)
        .attr("fill", "none")
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5)
        .attr("marker-end", "url(#arrow)");

    //Hover effect for nodes
    const nodes = vis.svg.selectAll(".node");
    const edges = vis.svg.selectAll(".edge");

    nodes
    .on('mouseover', (event, d) => {
        const alive_status = 
            vis.filter != "none"
                ? vis.phaseNodes.has(d.id) ? "True" : "False"
                : "True";
    
        const CREATE = 7;
        const KILL   = 3;

        const creationPhase = getFirstPhaseForInstType(d, CREATE) ?? "N/A";
        const killPhase = getFirstPhaseForInstType(d, KILL) ?? "N/A";

        const OPT_TYPES = new Set([0, 1, 2, 4, 6]); 

        const optimizedPhases = new Set();
        for (const rec of Object.values(d.instAccess || {})) {
            if (OPT_TYPES.has(rec.type)) optimizedPhases.add(Number(rec.phaseFnId));
        }
        const optimizedPhasesStr =
            optimizedPhases.size ? Array.from(optimizedPhases).sort((a,b)=>a-b).join(", ") : "None";  
    
        const nodeXPosition = vis.circles[d.id]["x"];
        const nodeYPosition = vis.circles[d.id]["y"];
        
        vis.iterableEdges = edges._groups[0];
        vis.iterableEdges.forEach(edge => {
            edge.setAttribute("stroke-width", 0);
            const edgeSourceXPosition = edge.__data__["source"]["x"];
            const edgeSourceYPosition = edge.__data__["source"]["y"];
            const edgeTargetXPosition = edge.__data__["target"]["x"];
            const edgeTargetYPosition = edge.__data__["target"]["y"];
    
            if ((edgeSourceXPosition == nodeXPosition && edgeSourceYPosition == nodeYPosition) ||
                (edgeTargetXPosition == nodeXPosition && edgeTargetYPosition == nodeYPosition)) {
                edge.setAttribute("stroke-width", 2.5);
            }
        });
        
        //Tooltip selection
        d3.select('#sidebar')
            .style('display', 'block')
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY) + 'px')
            .html(`
                <ul>
                  <li><strong>Node ID:</strong> ${d.id}</li>
                  <li><strong>Opcode:</strong> ${d.opcode}: ${d.mnemonic}</li>
                  <li><strong>Alive?:</strong> ${alive_status}</li>
                  <li><strong>Size:</strong> ${d.size} bytes</li>
                  <li><strong>Created in Phase:</strong> ${creationPhase}</li>
                  <li><strong>Modified in Phase(s):</strong> ${optimizedPhasesStr}</li>
                  <li><strong>Killed in Phase:</strong> ${killPhase}</li>
                </ul>
              `);
    })
    .on('mouseleave', () => {
        vis.iterableEdges.forEach(edge => {
            edge.setAttribute("stroke-width", 0.5);
        });

        d3.select('#sidebar').style('display', 'none');
    });
}

/**
 * Parses through the entire IR file and generates a data structure containing every single 
 * node's incoming edges for every single phase.
 * 
 * @returns nodeEdges -- a dictionary of the following format: keys with node IDs, values as sub-dictionarys with
 * keys as phase IDs, values as a list of incoming edges.
 */

function organizeEdges() {
    let vis = this;

    const nodeEdges = new Map();

    vis.nodes.forEach(node => {

        const phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary);

        const node_removed = Array.from(Object.entries(node.removed));
        const node_replaced = Array.from(Object.entries(node.replaced));
        const node_added = Array.from(Object.entries(node.added));
        node_instructions = node.instAccess;

        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        var edge_relevant_instructions = [];

        for (const instruction of node_removed) edge_relevant_instructions.push(instruction);
        for (const instruction of node_replaced) edge_relevant_instructions.push(instruction);
        for (const instruction of node_added) edge_relevant_instructions.push(instruction);

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

                if (Number(vis.phaseIDs[phaseID]) == first_instruction_phase) {
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), node.initialEdges);
                }

                while (Number(vis.phaseIDs[phaseID]) < instructionPhase) {
                    phaseID += 1;
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseID - 1]).slice());
                }
            }

            if (node_replaced.length != 0 && node_replaced.includes(instruction)) {
                const replacedEntry = node_replaced.find(([key]) => key === instructionID.toString());
                if (replacedEntry) {
                    var instruction = replacedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase).slice();
                    edges[instruction.position] = instruction.to;
                    phaseDictionary.set(instructionPhase, edges);
                }
            }

            if (node_removed.length != 0 && node_removed.includes(instruction)) {
                const removedEntry = node_removed.find(([key]) => key === instructionID.toString());
                if (removedEntry) {
                    var instruction = removedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase);
                    edges.splice(edges.indexOf(instruction.nodeId), 1);
                    phaseDictionary.set(instructionPhase, edges);
                }
            }

            if (node_added.length != 0 && node_added.includes(instruction)) {
                const addedEntry = node_added.find(([key]) => key === instructionID.toString());
                if (addedEntry) {
                    var instruction = addedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase);
                    edges[instruction.position] = instruction.nodeId;
                    phaseDictionary.set(instructionPhase, edges);
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
        

    })
    console.log(nodeEdges);

    return nodeEdges;
}

/**
 * Parses through all of the instructions for every node of the JSON file and identifies
 * which nodes are alive and which are dead for every single phase.
 * 
 * @returns activeNodesByPhase -- a dictionary with keys as phase IDs and values as a set
 * of node IDs representing all nodes alive during that phase.
 */

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

/**
 * Parses through the fnId2Name dictionary of the IR file to find all phase names
 * and phase IDs of optimization that the compiler went through.
 * 
 * vis.phaseIDs and vis.phases are declared during initVis and are filled using this function.
 */
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