class ListOfInteger {
  static shortDescription(): string {
    return "list of integers"
  }

  static longDescription(): string {
    return "LIST OF INTEGERS, represented by square brackets, and any numbers contained as comma separated digits: [1,2,3,4,5]"
  }

  static placeholderText(): string {
    return "[]"
  }

  static valid(input: any): boolean {
    var as_list;
    try {
      // Parse string as a list, with brackets required
      if (input.trim()[0] !== "[") {
        console.log("no starting bracket")
        return false;
      }
      as_list = JSON.parse(input);
      if (as_list.length > 0) {
        for (var i = 0; i < as_list.length; i++) {
          // Make sure items are integers
          if (!this.asIntEvaluator(as_list[i])) {
            console.log("member not integer")
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      // console.log("error: ", e)
      return false;
    }
  }

  private static asIntEvaluator(item: any) {
    if (Number.isInteger(item)) {
      return true;
    }
    return false;
  }

  static parse(input: any): number[] {
    return JSON.parse(input);
  }

  static areEquivalent(first: any[], second: any[]): boolean {
    if (first === second) {
      return true
    }
    if (first.length !== second.length) {
      return false
    }
    for (var i = 0; i < first.length; ++i) {
      if (first[i] !== second[i]) return false;
    }
    return true
  }

  // With brackets
  static displayString(nums: number[]): string {
    var as_str = "["
    for (var i = 0; i < nums.length; i++) {
      if (as_str.length > 1) {
        as_str += ", "
      }
      // Assuming that each member of the list has a toString method
      as_str += nums[i].toString()
    }
    as_str += "]"
    return as_str
  }

  // Without brackets
  static dbString(a_list: number[]): string {
    if (a_list === undefined) {
      return ""
    }
    var already_str = JSON.stringify(a_list)
    if (!already_str.includes("[") && !already_str.includes("]") && !already_str.includes(",")) {
      return already_str
    }

    var as_str = ""
    for (var i = 0; i < a_list.length; i++) {
      if (as_str.length > 0) {
        as_str += " "
      }
      as_str += JSON.stringify(a_list[i])
    }
    if (as_str.length === 0) {
      return "empty"
    }
    return as_str
  }
}

export default ListOfInteger