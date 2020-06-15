/**
 * This class represents the boolean type for function objects
 */
class Bool {
  static shortDescription() {
    return "boolean"
  }

  // Used in function signatures describing input and output types
  static longDescription() {
    return "boolean, represented by the words true or false with no capitalization"
  }

  // No placeholder value
  static placeholderText(): string {
    return ""
  }

  // Returns whether a string represents a valid boolean value
  static valid(member: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(member)
    } catch {
      return false
    }
    if (typeof parsed !== "boolean") {
      return false
    }

    return true
  }

  // Returns a javascript boolean according to text
  static parse(input: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(input)
    } catch {
      return false
    }
    return parsed
  }

  // Determines if two strings represent the same boolean
  static areEquivalent(first: any, second: any): boolean {
    return this.parse(first) === this.parse(second)
  }

  // Formats boolean to string for display in evaluation screen console
  static displayString(member: boolean): string {
    return member.toString()
  }

  // Formats boolean to string for storage in database
  static dbString(member: boolean): string {
    return member.toString()
  }
}

export default Bool