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

//Store data into global object
// IR_data = loadData().catch(console.warn);

/**
 * Sets up the visualization, creating an SVG and reading in nodes
 * and edges
 */
async function initVis() {
    const data = await loadData();
    const width = 200;

    const boxHeight = 200;
    const svg = d3.select("#chart-area")
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

    // Loading in a constant for 
    const nodes = data.nodes;
    const edges = new Map();

    console.log("nodes:", nodes);
   
    nodes.forEach(node => {
        edges.set(node.id, node.edges)
        console.log(edges.get(node.id))
    });

    var circles = []
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
        circles.push(node_coordinates)
        xCoordinate += 10;
        });

    console.log("circles:", circles)

    console.log(circles[0]);

    svg.selectAll("circle")
        .data(circles)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => circles[i].get("x"))  
        .attr("cy", (d, i) => circles[i].get("y")) 
        .attr("r", 1) 
        .attr("fill", "steelblue");

    svg.selectAll("edges")
        .data(edges)
        .enter()
        .append(d3.linkHorizontal()
        .x(d, circles[edges.get(i)])
    )


    // svg.selectAll("circle")
    //     .data(nodes)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", (d, i) => (i * 40) % width + 20)  
    //     .attr("cy", (d, i) => Math.floor(i / (width / 40)) * 40 + 20)
    //     .attr("r", 5)
    //     .attr("fill", "steelblue")
    //     .attr("opacity", 0.7);


}


//Delay initVis to ensure data has loaded
initVis();


