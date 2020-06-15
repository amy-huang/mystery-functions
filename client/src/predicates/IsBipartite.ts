import ConcreteInstParsing from "./ConcreteInstParsing"
import GraphPred from "./GraphPred"

class IsBipartite extends GraphPred {
  static description(): string {
    return "IsBipartite"
  }

  // Assumed isnt already screened as valid
  static function(rawText: string): boolean {
    var sets = ConcreteInstParsing.setDefs(rawText)
    var nodes = this.makeNodes(sets)
    
    // To check for acyclicity, do a DFS from every node
    // Should never get back to itself
    for (var i = 0; i < nodes.length; i++) {
      // Found disqualifying cycle
      if (nodes[i].oddCycle()) {
        return false
      }
    }
    return true
  }

  static inputGenerators(): Function[] {
    return [() => {return `inst myInst {
      Node = A 
      edges = A->A
    }`}, () => {return `inst myInst {
      Node = A
      edges = none
    }`}, () => {return `inst myInst {
      Node = A + B
      edges = A->B + B->A
    }`}, () => {return `inst myInst {
      Node = A + B + C
      edges = A->B + A->C + B->C
    }`}, () => {return `inst myInst {
      Node = A + B + C
      edges = A->B + B->C + C->A
    }`}, () => {return `inst myInst {
      Node = A + B + C
      edges = A->B + C->B
    }`}, () => {return `inst myInst {
      Node = A + B + C + D
      edges = A->B + B->C + C->D + D->A
    }`}, () => {return `inst myInst {
      Node = A + B + C + D + E
      edges = A->B + B->C + C->D + D->E + E->A
    }`}
  ]
  }

  static answerText(): string {
    return `This predicate evaluates to true if and only if the input graph is bipartite - the vertices can be partitioned into two disjoint sets so that every edge connects two vertices in different sets. 
    
    Equivalently, if a graph does NOT contain an odd-length cycle, it is bipartite.`
  }
}
export default IsBipartite