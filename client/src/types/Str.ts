import { string } from "prop-types";


// TODO: see if special characters breaks the DB entering - special charas like with [], punctuation, etc.

class Str {
  static shortDescription() {
    return "string"
  }

  static longDescription() {
    return "STRING, represented by text surrounded by double quotes, like so: \"Hello world.\""
  }

  static placeholderText(): string {
    return "\"\""
  }

  static valid(output: any): boolean {
    // Check that text begins and ends with a double quote
    if (output.trim()[0] !== "\"") {
      return false
    }
    if (output.trim()[output.trim().length - 1] !== "\"") {
      return false
    }

    // Only allow the beginning and end double quotes
    var count = (output.match(/"/g) || []).length;
    if (count !== 2) {
      return false
    }

    // No JSON parsing to avoid unexpected side effects
    // var parsed
    // try {
    //   parsed = JSON.parse(output)
    // } catch {
    //   return false
    // }
    // return typeof parsed === "string"
    return true
  }

  static parse(input: any): string {
    // var parsed
    // try {
    //   parsed = JSON.parse(input)
    // } catch {
    //   return ""
    // }

    return input
  }

  static areEquivalent(first: any, second: any): boolean {
    return this.parse(first) === this.parse(second)
  }

  static displayString(member: string): string {
    return member
  }

  // TODO: will special charas be an issue for putting in DB?
  static dbString(member: string): string {
    return member
  }
}

export default Str