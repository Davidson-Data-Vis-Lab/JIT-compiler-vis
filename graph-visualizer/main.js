/**
 * Creates a very unorganized graph of all nodes and edges at the
 * very end of optimization of an IR file.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

//Global object to store data
let IR_data;

//Load data and console log upon success
async function loadData() {
  IR_data = await d3.json("../toy-datasets/IR/ir-after-spring-break.json");
  console.log("loaded the data", IR_data);
  return IR_data;
}

/**
 * Sets up the visualization, creating an SVG and reading in nodes
 * and edges
 */
async function initVis() {
    let vis = this;

    vis.data = await loadData();

    const width = 750;
    const boxHeight = 1000;

    //Default view for showing all nodes at full opacity.
    vis.filter = "none";

    vis.svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", boxHeight);
        //.attr('viewBox', [0, 0, width, boxHeight]);

    // Define the arrowhead marker variables
    const markerBoxWidth = 20;
    const markerBoxHeight = 20;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const markerWidth = markerBoxWidth / 2;
    const markerHeight = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [0, 20], [20, 10]];
    vis.tooltipPadding = 15;

    vis.phases = [];
    vis.phaseIDs = [];
    getPhases();

    //Enables us to turn paths into directional arrows
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

    //Organize data for easier access
    vis.nodes = vis.data.nodes;
    
    const nodeToEdges = new Map();
   
    // Creating a map with nodes to respective edges array 
    vis.nodes.forEach(node => {
        nodeToEdges.set(node.id, node.edges)
        //console.log(nodeToEdges.get(node.id));
    });

    const edges = [];
    // Create an array of arrays that represent all edges
    vis.nodes.forEach(node => {
        var node_edges = nodeToEdges.get(node.id)
        node_edges.forEach(targetNode => {
            if (targetNode != -1) {
                edges.push([node.id, targetNode])
            }
        });
    });

    const radius = 35;
    const cols = 10;

    // Compute actual render coordinates (same formula as renderVis)
    vis.circles = vis.nodes.map((node, i) => {
        const cx = (i * (radius * 2) + radius) % (cols * radius * 2);
        const cy = (2 * radius) * Math.floor(i / cols) + radius * 2;
        return { x: cx, y: cy };
    });

    // Build links using real render coordinates
    vis.links = edges.map(([sourcenode, targetnode]) => {
        return {
            source: vis.circles[sourcenode],
            target: vis.circles[targetnode]
        };
    });

    vis.linkPath = d3.linkHorizontal()
        .x(d => d.x)
        .y(d => d.y);
    

    // Gives d3 a mapping of how to extract data and create paths
    // vis.linkPath = d3.linkHorizontal()
    //     .x(d => d.get("x"))
    //     .y(d => d.get("y"));

    vis.nodeEdges = organizeEdges();
    vis.activeNodesByPhase = determineNodeActiveStatus(vis.nodeEdges);
    createButtons();
    updateVis();

}

/**
 * Updates the visualization based on the optimziation phase selected by the user.
 */
// function updateVis() {
//     let vis = this;

//     if (vis.filter != "none") {
//         vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);
//     }

//     renderVis();
// }
function updateVis() {
    let vis = this;
  
    if (vis.filter != "none") {
      vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);
  
      const phaseEdges = [];
      vis.nodes.forEach(node => {
        if (!vis.phaseNodes.has(node.id)) return; // source must be alive
  
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
  
      vis.links = phaseEdges.map(([sourcenode, targetnode]) => ({
        source: vis.circles[sourcenode],
        target: vis.circles[targetnode]
      }));
  
    } else {
      const allEdges = [];
      vis.nodes.forEach(node => {
        node.edges.forEach(targetNode => {
          if (targetNode !== -1) allEdges.push([node.id, targetNode]);
        });
      });
  
      vis.links = allEdges.map(([s, t]) => ({
        source: vis.circles[s],
        target: vis.circles[t]
      }));
    }
  
    renderVis();
  }

function getPhasesForInstType(node, type) {
    const phases = new Set();
    for (const rec of Object.values(node.instAccess || {})) {
      if (rec.type === type) phases.add(Number(rec.phaseFnId));
    }
    return Array.from(phases).sort((a,b) => a - b);
  }
  
  function getFirstPhaseForInstType(node, type) {
    const phases = getPhasesForInstType(node, type);
    return phases.length ? phases[0] : null;
  }

/**
 * Draws the nodes and edges onto the SVG
 */
function renderVis() {
    let vis = this;

    const radius = 35;

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

    vis.svg.selectAll("text")
        .data(vis.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d, i) => vis.circles[i].x)
        .attr("y", (d, i) => vis.circles[i].y)
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
        const killPhase     = getFirstPhaseForInstType(d, KILL) ?? "N/A";

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
    
        d3.select('#sidebar')
            .style('display', 'block')
            .style('left', (event.pageX + vis.tooltipPadding) + 'px')
            .style('top', (event.pageY + vis.tooltipPadding) + 'px')
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

initVis();

/**
 * Creates a dictionary object that tracks the current edges of each node
 * for every optimization phase.
 *
 * Returns the dictionary object
 */

function organizeEdges() {
    let vis = this;

    //Map to be returned; store all edges for each phase of each node
    //Keys: Nodes, values: sub-dictionary with keys: phaseIDs and values: list of outgoing edges (nodeIDs)
    nodeEdges = new Map();

    vis.nodes.forEach(node => {

        phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary)

        //Get all removed, replaced, and instAccess instructions
        node_removed = Array.from(Object.entries(node.removed));
        node_replaced = Array.from(Object.entries(node.replaced));
        node_instructions = node.instAccess;

        //Get the very first instruction for each node and determine what phase it is part of
        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        //Set the intial edges for the first phase that the node is created in
        phaseDictionary.set(first_instruction_phase, node.initialEdges.slice()); 

        //Store all removed and replaced instructionIDs within this list
        var edge_relevant_instructions = [];

        for (const instruction of node_removed) {
            edge_relevant_instructions.push(instruction[0]);
        }

        for (const instruction of node_replaced) {
            edge_relevant_instructions.push(instruction[0]);
        }

        //Sort instructions so that we can go through optimization temporally
        edge_relevant_instructions.sort((a, b) => a - b);

        //Start phaseNumber at 0 for indexing
        var phaseNumber = 0;

        edge_relevant_instructions.forEach(instructionID => {

            const instructionPhase = node_instructions[instructionID].phaseFnId;

            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                if (instructionPhase < first_instruction_phase) {

                    //Node not created yet, so set edges to empty list
                    phaseDictionary.set(instructionPhase, []); 

                }

                else {

                    //Get edges from previous phase
                    phaseDictionary.set(instructionPhase, phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber]).slice());

                }
                
                phaseNumber += 1;

            }

            if (node_replaced.length != 0) {

                //Check replaced for the instruction and replace edge
                const replacedEntry = node_replaced.find(([key]) => key === instructionID.toString());
                if (replacedEntry) {
                    var instruction = replacedEntry[1];
                    var edgePosition = instruction.position;
                    var newValue = instruction.to;
                    var edges = phaseDictionary.get(instructionPhase);
                    edges[edgePosition] = newValue;
                    phaseDictionary.set(instructionPhase, edges);
                }
                
            }

            else if (node_removed.length != 0) {
                const removedEntry = node_removed.find(([key]) => key === instructionID.toString());
                if (removedEntry) {
                    var instruction = removedEntry[1];
                    var removedNode = instruction.nodeId;
                    var edges = phaseDictionary.get(instructionPhase);
                    edges.splice(edges.indexOf(removedNode), 1);
                    phaseDictionary.set(instructionPhase, edges);
                }
            }

        })

        if (edge_relevant_instructions.length == 0) {

            phaseNumber = 0;
            
            vis.phaseIDs.forEach(phase => {

                phase = Number(phase);

                if (!(Array.from(phaseDictionary.keys()).includes(phase))) {

                    if (phase < first_instruction_phase) {

                        phaseDictionary.set(Number(phase), []);

                    }

                    else {

                        phaseDictionary.set(phase, phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber - 1]));

                    }

                }

                phaseNumber += 1;

            })

        }
        

    })

    return nodeEdges;
}


/**
 * Determines which nodes are active in each phase and organizes this information
 * within a dictionary.
 * 
 * Returns a dictionary object with keys as phase numbers and values as sets of 
 * active nodes in that phase.
 */
function determineNodeActiveStatus() {
    let vis = this;
  
    const CREATE = 7;
    const KILL = 3;
  
    // Map to be returned
    // Keys: Phase IDs, values: set of nodeIDs representing active nodes by phase
    const activeNodesByPhase = new Map();
    
    // Track which nodes are alive as we process phases
    const alive = new Set();
    const phases = vis.phaseIDs.map(Number).sort((a, b) => a - b);
    
    // Initialize activeNodesByPhase for all phases
    for (const phase of phases) {
        activeNodesByPhase.set(phase, new Set());
    }
    
    // Process each phase in order
    for (const phase of phases) {
        
        // Look through all nodes to find CREATE and KILL events for this phase
        vis.nodes.forEach(node => {
            
            // Look at instAccess for this node
            for (const [instId, rec] of Object.entries(node.instAccess || {})) {
                const eventPhase = Number(rec.phaseFnId);
                
                // Only process events that happen in the current phase
                if (eventPhase === phase) {
                    
                    // Apply creates - node becomes alive starting this phase
                    if (rec.type === CREATE) {
                        alive.add(node.id);
                    }
                    
                    // Apply kills - node dies starting this phase
                    if (rec.type === KILL) {
                        alive.delete(node.id);
                    }
                }
            }
        });
        
        activeNodesByPhase.set(phase, new Set(alive));
    }
    
    return activeNodesByPhase;
}


/**
 * Dynamically creates HTML buttons with event listeners based on the phases within the data.
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
        buttonBox.appendChild(btn);

        btn.addEventListener("click", () => {
            //vis.filter = Number(btn.textContent.split(" ")[1]);
            document.querySelectorAll(".phase_btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            var phaseID = btn.textContent.split(" ")[1];
            //Remove ending colon
            phaseID = phaseID.substring(0, phaseID.length - 1);
            vis.filter = Number(phaseID);
            updateVis();
        });
    };
}

/**
 * Parses the IR file to create a list of all phase IDs found within the file.
 * 
 * Returns a list with all phase IDs within the IR.
 */
function getPhases() {
    let vis = this;

    const functionIds = Object.entries(vis.data["fnId2Name"]);

    functionIds.forEach(functionId => {

        if (functionId[1].includes("Phase::Run")) {

            vis.phaseIDs.push(functionId[0]);
            vis.phases.push(functionId[1]);

        }

    })

}