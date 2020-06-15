/**
 * Template for a predicate object that takes in a graph concrete instance
 * Only missing a function() method that would take in text representing the input instance
 */
import ConcreteInstParsing from "./ConcreteInstParsing"
import Node from "./Node"
import Bool from "../types/Bool"

class GraphPred {
  numArgs = 1

  static makeNodes(sets: Map<string, Array<string>>): Array<Node> {
    var nodes = new Map<string, Node>()
    var nodeList = Array<Node>()

    // Get nodes and map them 
    var nodeNames = sets.get("Node")
    if (nodeNames !== undefined) {
      // Check for empty set of nodes
      if (nodeNames.length === 1 && nodeNames[0] === "none") {
        return nodeList
      }
      // Add node names to map
      nodeNames.forEach((name) => {
          var newNode = new Node(name)
          nodes.set(name, newNode)
          nodeList.push(newNode)
      })
    }

    // Build node edge relationships
    var edgesTexts = sets.get("edges")
    if (edgesTexts !== undefined) {
      // Check for empty relation for edges
      if (edgesTexts.length === 1 && edgesTexts[0] === "none") {
        return nodeList
      }
      // Add edge relationships to mapped nodes
      for (var j = 0; j < edgesTexts.length; j++) {
        var elems = edgesTexts[j].split("->")
        // console.log(elems)
        var fromName = elems[0].trim()
        var toName = elems[1].trim()
        
        var fromNode = nodes.get(fromName)
        var toNode = nodes.get(toName)
        if (fromNode !== undefined && toNode !== undefined ) {
          fromNode.addDest(toNode)
          toNode.addSrc(fromNode)
        } 
      }
    }
    return nodeList
  }

  // Checks if concrete inst specified is valid
  static validInst(rawText: string): boolean {
    var sets = ConcreteInstParsing.setDefs(rawText)
    if (!GraphPred.predSpecificValid(sets)) {
      return false
    }
    return true
  }

  static predSpecificValid(sets: Map<string, Array<string>>): boolean {
    if (!sets.has("edges") || !sets.has("Node")) {
      alert("Instance does not specify both atom sets Node and edges")
      return false
    }
    if (sets.size > 2) {
      alert("Instance specifies too many atom sets. There should only be Node and edges")
      return false
    }

    var nodeNames = sets.get("Node")
    if (nodeNames !== undefined) {
      for (var i = 0; i < nodeNames.length; i++) {
        if (!nodeNames[i].match(/^[A-Za-z0-9]+$/)) {
          alert(nodeNames[i] + " is an invalid node name. Please only use alphanumeric characters in node names")
          return false
        }
      }
    }

    var edges = sets.get("edges")
    var seenEdges = new Array<Array<string>>()
    if (edges !== undefined && nodeNames !== undefined) {
      for (var j = 0; j < edges.length; j++) {
        if (edges[j] === "none") {
          break
        }

        var elems = edges[j].split("->")
        // Check is a tuple
        if (elems.length != 2) {
          alert("Edge " + edges[j] + " is not a valid binary tuple:")
          return false
        }
        // Check if each element is a node
        var firstName = elems[0].trim()
        var secondName = elems[1].trim()
        if (!nodeNames.includes(firstName)) {
          alert("Element " + firstName + " of tuple " + edges[j] + " is not in Node")
          return false
        }
        if (!nodeNames.includes(secondName)) {
          alert("Element " + secondName + " of tuple " + edges[j] + " is not in Node")
          return false
        }

        // Check if edge seen before
        if (seenEdges.includes([firstName, secondName])) {
            alert("Duplicate edge: " + edges[j])
            return false
        }
        seenEdges.push([firstName, secondName])
      }
    }
    return true
  }

  static inputDescription(): string {
    return "set named 'Node' of node names, and a binary relation named 'edges' containing pairs of nodes."
  }

  static outputDescription(): string {
    return Bool.longDescription()
  }

  static parseOutput(out: any): boolean {
    return Bool.parse(out)
  }

  static validOutput(out: any): boolean {
    return Bool.valid(out)
  }

  static equivalentOutputs(first: any, second: any): boolean {
    return Bool.areEquivalent(first, second)
  }

  static inputPlaceHolderText(): string {
    return `inst myInst {
  Node = A
       + B
       + C
  edges = none
}`
  }

  static outputPlaceHolderText(): string {
    return Bool.placeholderText()
  }

  // strings for instances and booleans shouldn't need changing
  static inputDBStr(input: any): string {
    return input.toString()
  }
  static outputDBStr(output: any): string {
    return output.toString()
  }
  static inputDisplayStr(input: any): string {
    return input.toString()
  }
  static outputDisplayStr(output: any): string {
    return output.toString()
  }

  // node A, edge A -> A
  static equivToFirstInst(defs: Map<string, Array<string>>): boolean {
    var nodes = GraphPred.makeNodes(defs)
    if (nodes.length !== 1) {
      return false
    }
    if (nodes[0].to.length !== 1) {
      return false
    }
    if (nodes[0].to[0] !== nodes[0]) {
      return false
    }
    return true
  }

  // node A, no edges
  static equivToSecondInst(defs: Map<string, Array<string>>): boolean {
    var nodes = GraphPred.makeNodes(defs)
    if (nodes.length !== 1) {
      return false
    }
    if (nodes[0].to.length !== 0) {
      return false
    }
    return true
  }

  // node A, no edges
  static equivToThirdInst(defs: Map<string, Array<string>>): boolean {
    var nodes = GraphPred.makeNodes(defs)
    if (nodes.length !== 2) {
      return false
    }
    var A = nodes[0]
    var B = nodes[1]
    if (A.to.length !== 1) {
      return false
    }
    if (A.to[0] !== B) {
      return false
    }
    if (B.to.length !== 1) {
      return false
    }
    if (B.to[0] !== A) {
      return false
    }
    return true
  }

  static ringChecker(size: number): (defs: Map<string, Array<string>>) => boolean {
    if (size < 1) {
      console.log("warning: ring of size < 1 checked for") 
    }

    return (defs: Map<string, Array<string>>) => {
      var edges = defs.get("edges")
      if (edges !== undefined) {
        if (edges.length !== size) {
          return false
        }
      } 
      var nodes = GraphPred.makeNodes(defs)
      if (nodes.length !== size) {
        return false
      }
      var start = nodes[0]
      var seen = Array<Node>()
      var next = start
      for (var i = 0; i < size; i++) {
        if (next.to.length !== 1) {
          return false
        }
        seen.push(next)
        next = next.to[0]
      }

      // Should have returned to start node
      if (next !== start) {
        return false
      }

      // Check that seen includes all nodes exactly once
      for (var i = 0; i < size; i++) {
        if (!seen.includes(nodes[i])) {
          return false
        }
        if (!nodes.includes(seen[i])) {
          return false
        }
      }
      return true
    }
  }

  static equivToFourthInst(defs: Map<string, Array<string>>): boolean {
    var nodes = GraphPred.makeNodes(defs)
    if (nodes.length !== 3) {
      return false
    }
    // Possible combos of A, B, C
    var combos = [[0, 1, 2],[0, 2, 1],[1, 2, 0],[1, 0, 2],[2, 0, 1],[2, 1, 0]]
    for (var i = 0; i < combos.length; i++) {
      var currCombo = combos[i]
      var A = nodes[currCombo[0]]
      var B = nodes[currCombo[1]]
      var C = nodes[currCombo[2]]

      if (A.to.length !== 2) {
        continue
      }
      if (!((A.to[0] === B && A.to[1] === C) || (A.to[0] === C && A.to[1] === B))) {
        continue
      }
      if (B.to.length !== 1) {
        continue
      } 
      if (B.to[0] !== C) {
        continue
      } 
      return true
    }
    return false
  }

  static equivToSixthInst(defs: Map<string, Array<string>>): boolean {
    var nodes = GraphPred.makeNodes(defs)
    if (nodes.length !== 3) {
      return false
    }
    // Possible combos of A, B, C
    var combos = [[0, 1, 2],[0, 2, 1],[1, 2, 0],[1, 0, 2],[2, 0, 1],[2, 1, 0]]
    for (var i = 0; i < combos.length; i++) {
      var currCombo = combos[i]
      var A = nodes[currCombo[0]]
      var B = nodes[currCombo[1]]
      var C = nodes[currCombo[2]]

      if (A.to.length !== 1) {
        continue
      } 
      if (A.to[0] !== C) {
        continue
      } 
      if (B.to.length !== 1) {
        continue
      } 
      if (B.to[0] !== C) {
        continue
      } 
      return true
    }
    return false
  }

  static quizQChecks(): Function[] {
    return [GraphPred.ringChecker(1), GraphPred.equivToSecondInst, GraphPred.ringChecker(2), GraphPred.equivToFourthInst, GraphPred.ringChecker(3), GraphPred.equivToSixthInst, GraphPred.ringChecker(4), GraphPred.ringChecker(5)]
  }
}
export default GraphPred