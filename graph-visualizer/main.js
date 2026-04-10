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

    // Mapping each node out to equidistance apart 
    // vis.circles = []
    // var xCoordinate = 20;
    // var yCoordinate = 10;
    // vis.nodes.forEach(node => {
    //     node_coordinates = new Map
    //     if (xCoordinate >= width) {
    //         xCoordinate = 20;
    //         yCoordinate += 10;
    //     }
    //     node_coordinates.set("x", xCoordinate);
    //     node_coordinates.set("y", yCoordinate);
    //     vis.circles.push(node_coordinates)
    //     xCoordinate += 10;
    //     });
    
    // //Create explict links (edges) where source node coordinates are aligned with target node coordinates
    // vis.links = edges
    // .map(([sourcenode, targetnode]) => {
    //     const sourcenode_coordinates = vis.circles[sourcenode]
    //     const targetnode_coordinates = vis.circles[targetnode]
    //     return {source: sourcenode_coordinates, target: targetnode_coordinates}
    // })
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

        // Rebuild links for the active phase
        const phaseEdges = [];
        vis.nodes.forEach(node => {
            // Only process edges for nodes that are active in this phase
            if (!vis.phaseNodes.has(node.id)) {
                return; // Skip this node if it's not active
            }
            
            const phaseDictionary = vis.nodeEdges.get(node.id);
            let activeEdges = null;
        
            const phases = Array.from(phaseDictionary.keys())
                .map(Number)
                .sort((a, b) => a - b);
        
            for (const p of phases) {
                if (p <= vis.filter) activeEdges = phaseDictionary.get(p);
                else break;
            }
        
            if (activeEdges === null) {
                activeEdges = node.initialEdges;
            }
            
            activeEdges.forEach(targetNode => {
                if (targetNode !== -1) {
                    phaseEdges.push([node.id, targetNode]);
                }
            });
        });

        vis.links = phaseEdges.map(([sourcenode, targetnode]) => ({
            source: vis.circles[sourcenode],
            target: vis.circles[targetnode]
        }));

    } else {
        // "none" filter: use final edges
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

/**
 * Draws the nodes and edges onto the SVG
 */
function renderVis() {
    let vis = this;

    const radius = 35;

    //Remove all previous elements so that we can redraw with new opacity values
    vis.svg.selectAll("*").remove();

    // Drawing circles out onto screen
    vis.svg.selectAll("circle")
        .data(vis.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", (d, i) => vis.circles[i].x)
        .attr("cy", (d, i) => vis.circles[i].y)
        // .attr("cx", (d, i) => (i * (radius * 2) + radius) % (10 * radius * 2)) // improve this spacing algorithm
        // .attr("cy", (d, i) => {


            // return (2 * radius) * Math.floor(i / 10) + radius * 2;
            // if (i < 10) {
            //     return 30;
            // }
            // if (i < 20) {
            //     return 40;
            // }
            // else if (i < 30) {
            //     return 50;
            // }
            // else if (i < 40) {
            //     return 60;
            // }
            // else {
            //     return 70;
            // }
        // })
        .attr("r", radius) 
        .attr("fill", "steelblue")
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
        // .attr("x", (d, i) => (i * (radius * 2) + radius) % (10 * radius * 2)) // update algorithm here 
        // .attr("y", (d, i) => {
            // return (2 * radius) * Math.floor(i / 10) + radius * 2;
            // if (i < 30) {
            //     return 40;
            // }
            // else if (i < 60) {
            //     return 45;
            // }
            // else {
            //     return 50;
            // }
        // }) 
        .attr("fill", "black")
        .style("font-size", "20px")
        .text(d => d.id);

    // Draw the paths
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

            //Calculate alive_status for tooltip
            const alive_status = 
                vis.filter != "none"
                    ? vis.phaseNodes.has(d.id) ? "True" : "False"
                : "True"

            const nodeEdges = 
                //This needs to be updated; what edges is the default view showing?
                vis.filter != "none"
                    //Check if node actually has
                    ? Array.from(vis.nodeEdges.get(d.id).keys()).includes(vis.filter)
                        ? vis.nodeEdges.get(d.id).get(vis.filter)
                        : "No edges within this phase"
                    : d.initialEdges;

            const nodeID = d.id;

            const nodeXPosition = vis.circles[nodeID]["x"];
            const nodeYPosition = vis.circles[nodeID]["y"];
            
            vis.iterableEdges = edges._groups[0];

            vis.iterableEdges.forEach(edge => {

                edge.setAttribute("stroke-width", 0);

                const edgeSourceXPosition = edge.__data__["source"]["x"];
                const edgeSourceYPosition = edge.__data__["source"]["y"];

                const edgeTargetXPosition = edge.__data__["target"]["x"];
                const edgeTargetYPosition = edge.__data__["target"]["y"];

                if ((edgeSourceXPosition == nodeXPosition && edgeSourceYPosition == nodeYPosition) ||
                    edgeTargetXPosition == nodeXPosition && edgeTargetYPosition == nodeYPosition) {
                        
                        edge.setAttribute("stroke-width", 2.5);

                }

            })

            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.tooltipPadding) + 'px')
                .style('top', (event.pageY + vis.tooltipPadding) + 'px')
                .html(`
                    <ul>
                        <li>Opcode - ${d.opcode + ":" + d.mnemonic} </li>
                        <li>Alive? - ${alive_status}</li>
                        <li>Edges - ${nodeEdges}</li>
                    </ul>
                `);

        })
        .on('mouseleave', () => {

            vis.iterableEdges.forEach(edge => {

                edge.setAttribute("stroke-width", 0.5);

            })

            d3.select('#tooltip').style('display', 'none');

        })
        
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
        edge_relevant_instructions = [];

        for (const instruction of node_removed) {
            edge_relevant_instructions.push(instruction[0]);
        }

        for (const instruction of node_replaced) {
            edge_relevant_instructions.push(instruction[0]);
        }

        //Sort instructions so that we can go through optimization temporally
        edge_relevant_instructions.sort((a, b) => a - b);

        //Start phaseNumber at -1 for indexing
        var phaseNumber = 0;

        edge_relevant_instructions.forEach(instructionID => {

            instructionPhase = node_instructions[instructionID].phaseFnId;

            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                // //Special Condition for 1st phase optimization takes place; set edges to inital edges -- might be obsolete in the future
                // if (phaseNumber == -1) {
                //     phaseDictionary.set(instructionPhase, node.initialEdges.slice());                  
                //     phaseNumber += 1;
                // }

                
                //Get edges from previous phase
                phaseDictionary.set(instructionPhase, phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber]).slice());
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
function determineNodeActiveStatus(nodeEdges) {
    let vis = this;

    //The map to be returned
    //Keys: Phase IDs, values: set of nodeIDs representing active nodes by phase
    activeNodesByPhase = new Map();

    vis.nodes.forEach(node => {

        const phaseDictionary = nodeEdges.get(node.id)

        //Look in every phase of each node
        for (const [phase, edges] of phaseDictionary.entries()) {

            if (!(Array.from(activeNodesByPhase.keys()).includes(phase))) {

                activeNodesByPhase.set(phase, new Set());

            }

            //Add each nodeID for every node in the edge
            for (const target_node of edges) {

                //Add each target node
                activeNodesByPhase.get(phase).add(target_node);
                //Add the source node as well
                activeNodesByPhase.get(phase).add(node.id);

            }

        }

    })

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