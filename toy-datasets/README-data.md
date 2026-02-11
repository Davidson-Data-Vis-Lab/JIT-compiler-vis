# IR and PoC Files

The Intermediate Representation (IR) files are generated from the trace of the Just-in-Time (JIT) compiler’s execution while optimizing the bytecode generated for the proof-of-concept (PoC) code. Not the entire code in the PoC file is being optimized. Only what is called a “Hot Code” is optimized, i.e., the subset of code that runs many times (e.g., the loop with the body statement does not change, iterates > 1000 times).

For example, the poc5129.js is a PoC file for Google V8’s bug report number [5129](https://issues.chromium.org/issues/42208482). The TurboFan (V8’s JIT compiler) *only* optimizes the function foo. Others are run by the interpreter in bytecode. The IR file (ir5129.json) is the abstract IR model (in graph form) generated and optimized by TurboFan for function foo.

Reference the “JSON File Specification” under the [JITCIRModeler GitHub repository](https://github.com/hlim1/JITCIRModeler).

