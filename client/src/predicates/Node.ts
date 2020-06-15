/**
 * Class for a graph node
 */
class Node {
    name = ""
    to = new Array<Node>() // Nodes this node has an edge to
    from = new Array<Node>() // Nodes that have an edge from them to this one

    constructor(name: string) {
        this.name = name
    }

    // Prints out all of the edges adjacent to this node
    printout(): string {
        var print = this.name + "\n"
        print += "  to:\n" 
        for (var i = 0; i < this.to.length; i++) {
            print += "  " + this.to[i].name + "\n"
        }
        print += "  from:\n" 
        for (var i = 0; i < this.from.length; i++) {
            print += "  " + this.from[i].name + "\n"
        }
        return print
    }

    // Add outgoing edge by recording destination node
    addDest(n: Node) {
        this.to.push(n)
    }

    // Add incoming edge by recording source node
    addSrc(n: Node) {
        this.from.push(n)
    }

    // Get destination nodes of outgoing edges
    dests(): Node[] {
        return this.to
    }

    // Get source nodes of incoming edges
    srcs(): Node[] {
        return this.from
    }

    // Return whether this node is part of a cycle
    cycle() {
        var seen = new Array<Node>()
        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.cycleHelper(seen) === true) {
                return true
            }
        }
        return false
    }
    cycleHelper(seen: Array<Node>): boolean {
        var newSeen = Array<Node>()
        for (var i = 0; i < seen.length; i++) {
            if (seen[i].name === this.name) {
                return true
            }
            newSeen.push(seen[i])
        }
        newSeen.push(this)

        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.cycleHelper(newSeen) === true) {
                return true
            }
        }
        return false
    }

    // Returns whether this node is part of a 3 cycle
    threeCycle() {
        var seen = new Array<Node>()
        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.threeCycleHelper(seen) === true) {
                return true
            }
        }
        return false
    }
    threeCycleHelper(seen: Array<Node>): boolean {
        var newSeen = Array<Node>()
        for (var i = 0; i < seen.length; i++) {
            if (seen[i].name === this.name) {
                if (seen.length - i === 3) {
                    return true
                }
                // Cycle that's not of length 3 seen
                return false
            }
            newSeen.push(seen[i])
        }
        newSeen.push(this)
        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.threeCycleHelper(newSeen) === true) {
                return true
            }
        }
        return false
    }

    // Returns whether an odd cycle was seen or not
    // Odd cycle means graph is not bipartite
    oddCycle() {
        var seen = new Array<Node>()
        seen.push(this)
        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.oddCycleHelper(seen) === true) {
                return true
            }
        }
        return false
    }
    oddCycleHelper(seen: Array<Node>): boolean {
        var newSeen = Array<Node>()
        for (var i = 0; i < seen.length; i++) {
            if (seen[i].name === this.name) {
                if ((seen.length - i) % 2 === 1) {
                    return true
                }
                // Even length cycle seen
                return false
            }
            newSeen.push(seen[i])
        }
        newSeen.push(this)
        for (var i = 0; i < this.to.length; i++) {
            var toNode = this.to[i]
            if (toNode.oddCycleHelper(newSeen) === true) {
                return true
            }
        }
        return false
    }
}
export default Node