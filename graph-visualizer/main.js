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

    const data = await loadData();

    const width = 200;
    const boxHeight = 200;

    vis.svg = d3.select("#chart-area")
        .append("svg")
        .attr('viewBox', [0, 0, width, boxHeight]);

    // Define the arrowhead marker variables
    const markerBoxWidth = 20;
    const markerBoxHeight = 20;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const markerWidth = markerBoxWidth / 2;
    const markerHeight = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [0, 20], [20, 10]];

    //Enables us to turn paths into directional arrows
    svg.append("defs")
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
    vis.nodes = data.nodes;
    const nodeToEdges = new Map();
   
    // Creating a map with nodes to respective edges array 
    nodes.forEach(node => {
        nodeToEdges.set(node.id, node.edges)
        //console.log(nodeToEdges.get(node.id));
    });

    const edges = [];
    // Create an array of arrays that represent all edges
    nodes.forEach(node => {
        var node_edges = nodeToEdges.get(node.id)
        node_edges.forEach(targetNode => {
            if (targetNode != -1) {
                edges.push([node.id, targetNode])
            }
        });
    });

    // Mapping each node out to equidistance apart 
    vis.circles = []
    var xCoordinate = 20;
    var yCoordinate = 10;
    nodes.forEach(node => {
        node_coordinates = new Map
        if (xCoordinate >= width) {
            xCoordinate = 20;
            yCoordinate += 10;
        }
        node_coordinates.set("x", xCoordinate);
        node_coordinates.set("y", yCoordinate);
        vis.circles.push(node_coordinates)
        xCoordinate += 10;
        });
    
    //Create explict links (edges) where source node coordinates are aligned with target node coordinates
    vis.links = edges
    .map(([sourcenode, targetnode]) => {
        const sourcenode_coordinates = vis.circles[sourcenode]
        const targetnode_coordinates = vis.circles[targetnode]
        return {source: sourcenode_coordinates, target: targetnode_coordinates}
    })

    // Gives d3 a mapping of how to extract data and create paths
    vis.linkPath = d3.linkHorizontal()
        .x(d => d.get("x"))
        .y(d => d.get("y"));

    organizeEdges();
    renderVis();

}

/**
 * Draws the nodes and edges onto the SVG
 */
function renderVis() {
    let vis = this;

    // Drawing circles out onto screen
    vis.svg.selectAll("circle")
        .data(vis.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("cx", (d, i) => 40 + ((i * 9) % 120)) // improve this spacing algorithm
        .attr("cy", (d, i) => {


            return i + 20
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
        })
        .attr("r", 2.5) 
        .attr("fill", "steelblue")
        .attr("opacity");

    vis.svg.selectAll("text")
        .data(vis.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d, i) => 38.5 + ((i * 9) % 120)) // update algorithm here 
        .attr("y", (d, i) => {
            return i + 20
            // if (i < 30) {
            //     return 40;
            // }
            // else if (i < 60) {
            //     return 45;
            // }
            // else {
            //     return 50;
            // }
        }) 
        .attr("fill", "black")
        .style("font-size", "2.5px")
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

    nodeEdges = new Map();

    vis.nodes.forEach(node => {

        phaseDictionary = new Map();
        nodeEdges.set(node.ID, phaseDictionary)

        node_removed = node.removed;
        node_replaced = node.replaced;
        node_instructions = node.instAccess;

        edge_relevant_instructions = [];

        node_removed.keys().forEach(instruction => {
            edge_relevant_instructions.push(instruction);
        });

        node_replaced.keys().forEach(instruction => {
            edge_relevant_instructions.push(instruction);
        });

        edge_relevant_instructions.sort(a, b => (a - b));

        //sconsole.log(edge_relevant_instructions);
    })
}

