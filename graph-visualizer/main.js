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
IR_data = loadData().catch(console.warn);

/**
 * Sets up the visualization, creating an SVG and reading in nodes
 * and edges
 */
function initVis() {
    const height = 300;
    const width = 700;
    const margin = {left: 10, top: 10, right: 10, bottom: 10};

    var svg = d3.select('#chart-area').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const nodes = IR_data.nodes.map(d => ({...d}));

    var edges = new Map();

    nodes.forEach(node => {
        edges.set(node.id, node.edges)
        console.log(edges.get(node.id))
    });

}

//Delay initVis to ensure data has loaded
setTimeout(initVis, 2500);



