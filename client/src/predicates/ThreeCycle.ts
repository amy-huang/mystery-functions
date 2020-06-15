import ConcreteInstParsing from "./ConcreteInstParsing"
import GraphPred from "./GraphPred"

class ThreeCycle extends GraphPred {
  static description(): string {
    return "ThreeCycle"
  }

  // Assumed isnt already screened as valid
  static function(rawText: string): boolean {
    var sets = ConcreteInstParsing.setDefs(rawText)
    var nodes = this.makeNodes(sets)
    
    // To check for acyclicity, do a DFS from every node
    // Should never get back to itself
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].threeCycle()) {
        return true
      }
    }
    return false
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
    return "This predicate evaluates to true if the input graph contains a 3-cycle; false otherwise."
  }
}
export default ThreeCycle