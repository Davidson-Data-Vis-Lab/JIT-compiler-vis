// In renderVis, draw force directed graph diagram - in a separate file call a function that exists in another
// And pass the data
// At the top, have a button that has "Layout Algorithm" choices that will change the layout based on the user's choice
// Buttons and tooltips stay the same - you can put those in a separate file
// Look at lab for more information
/**
 * Creates a very unorganized graph of all nodes and edges at the
 * very end of optimization of an IR file.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

// Global object to store data
let IR_data;

//Load data and console log upon success
async function loadData() {
  IR_data = await d3.json("../toy-datasets/IR/ir-after-spring-break.json");
  console.log("loaded the data", IR_data);
  return IR_data;
  
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}


async function graphBuilder() {
    let vis = this;

    vis.data = await loadData();
    vis.phases = [];
    vis.phaseIDs = [];
    
    getPhases(); 

    vis.nodes = vis.data.nodes;
    vis.links = buildLinks(); 
    const types = ["basic"]

    const links = vis.links.map(d => Object.create(d));
    const nodes = vis.nodes.map(d => Object.create(d));

    const width = 800;
    const height = 800;

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('collide', d3.forceCollide(d => 65))

    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width * 1.5)
        .attr("height", height * 1.5)
        .attr("viewBox", [-width / 2, -height / 2, width, height])

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(types)
        .join("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 38)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "black")
        .attr("d", 'M0,-5L10,0L0,5');

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", "black")
        .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(drag(simulation));

    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 25)
        .attr('fill', d => '#6baed6');

    node.append("text")
        .attr("x", 30 + 4)
        .attr("y", "0.31em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

    node.on('dblclick', (e, d) => console.log(nodes[d.index]))


    simulation.on("tick", () => {
        link.attr("d", d =>`M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    //return svg.node();
}


// /**
//  * Creates a dictionary object that tracks the current edges of each node
//  * for every optimization phase.
//  *
//  * Returns the dictionary object
//  */
function organizeEdges() {
    let vis = this;

    //Map to be returned; store all edges for each phase of each node
    //Keys: Nodes, values: sub-dictionary with keys: phaseIDs and values: list of outgoing edges (nodeIDs)
    const nodeEdges = new Map();

    vis.nodes.forEach(node => {

        const phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary)

        //Get all removed, replaced, and instAccess instructions
        const node_removed = Array.from(Object.entries(node.removed));
        const node_replaced = Array.from(Object.entries(node.replaced));
        node_instructions = node.instAccess;

        //Get the very first instruction for each node and determine what phase it is part of
        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        //Store all removed and replaced instructionIDs within this list
        var edge_relevant_instructions = [];

        for (const instruction of node_removed) {
            edge_relevant_instructions.push(instruction);
        }

        for (const instruction of node_replaced) {
            edge_relevant_instructions.push(instruction);
        }

        //Sort instructions so that we can go through optimization temporally
        // Changed to be sorting numerically by instruction ID
        edge_relevant_instructions.sort((a, b) => Number(a[0]) - Number(b[0]))

        //Start phaseNumber at 0 for indexing -- update this
        var phaseNumber = 0;
        var phaseID = 0;

        //Set all phases that are before the first_instruction_phase to an empty array (node has not been created yet)
        while (first_instruction_phase > Number(vis.phaseIDs[phaseID])) {

                phaseDictionary.set(Number(vis.phaseIDs[phaseID]), []); 
                phaseID += 1;

        }

        edge_relevant_instructions.forEach(instruction => {

            const instructionID = instruction[0];

            const instructionPhase = node_instructions[instructionID].phaseFnId;

            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                //If we are at the phase that the node was created in, set its edges to inital edges of the node (only once)
                if (Number(vis.phaseIDs[phaseID]) == first_instruction_phase && 
                    !(Array.from(phaseDictionary.keys()).includes(first_instruction_phase))) {

                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), node.initialEdges);

                }

                //In case we have moved on to a different optimization phase, retrieve edges from previous phase
                //Accounts for if a node doesn't go through a particular optimization phase and still retrieves edges
                while (Number(vis.phaseIDs[phaseID]) < instructionPhase) {

                    phaseID += 1;
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseID - 1]).slice());

                }

            }

            //Check replaced for the instruction and replace edge
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

            //Similarly, check removed for the instruction and remove the node
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

        })

        //In the case that a node does not go through optimization, set all phases to either empty (if before creation) or
        // to inital edges (after creation)
        if (edge_relevant_instructions.length == 0) {

            phaseNumber = 0;

            phaseDictionary.set(first_instruction_phase, node.initialEdges);
            
            vis.phaseIDs.forEach(phase => {

                phase = Number(phase);

                if (!(Array.from(phaseDictionary.keys()).includes(phase))) {

                    if (phase < first_instruction_phase) {

                        phaseDictionary.set(Number(phase), []);

                    }

                    else {

                        phaseDictionary.set(Number(phase), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber - 1]));

                    }

                }

                phaseNumber += 1;

            })

        }

        //If node goes through optimization, make sure that phases after last optimization phase that node goes through
        // are carried over to remaining phases
        else {

            for (let i = 0; i < vis.phaseIDs.length; i++) {

                phaseKeys = Array.from(phaseDictionary.keys())

                if (!(phaseKeys.includes(Number(vis.phaseIDs[i])))) {

                    phaseDictionary.set(Number(vis.phaseIDs[i]), phaseDictionary.get(phaseKeys[i - 1]))

                }

            }

        }
        

    })

    return nodeEdges;
}

function buildLinks() {
    linksArray = [];

    const edgesByPhase = organizeEdges();
    var i = 0;
    edgesByPhase.forEach(node => {
        
       const edges = node.get(93598);

       edges.forEach(sourceNode => {
        const link = {
            source: sourceNode,
            target: i,
            type: "basic"
        }
        linksArray.push(link)
       })
        i++;
    })

    return linksArray;

}

    

graphBuilder();

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