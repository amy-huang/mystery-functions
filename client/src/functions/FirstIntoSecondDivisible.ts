import Bool from "../types/Bool";
import Integer from "../types/Integer";

// Need to show 2 input text fields and do checking on each
// # args property for each fcn needs to exist, and actual
// input put into fcn could be an array or json to support
// multiple inputs of differing types.
// process inputs fcn somehow...

class FirstIntoSecondDivisible {
  static inputType = Integer
  static numArgs = 2
  static outputType = Bool

  static description(): string {
    return "FirstIntoSecondDivisible"
  }

  static function(divider: number, num: number): boolean {
    if (num === 0 && divider === 0) {
      return true
    }

    if (num % divider !== 0) {
      return false
    }
    return true
  }

  static inputGenerators(): Function[] {
    return [() => { return [2, 8] }, () => { return [8, 2] }, () => { return [2, 0] }]
  }

  static answerText(): string {
    return "This function returns whether or not the first integer argument divides evenly into the second one. So divides_evenly(2, 4) = true, and divides_evenly(4, 5) = false."
  }

  static inputPlaceHolderText(): string {
    return this.inputType.placeholderText()
  }

  static outputPlaceHolderText(): string {
    return this.outputType.placeholderText()
  }

  static inputDescription(): string {
    return this.inputType.longDescription()
  }

  static outputDescription(): string {
    return this.outputType.longDescription()
  }

  static validInput(input: any): boolean {
    if (!this.inputType.valid(input)) {
      return false
    }
    return true
  }

  /* Should not have to touch functions below here! */

  static validOutput(input: any): boolean {
    return this.outputType.valid(input)
  }

  static parseInput(input: any): number {
    return this.inputType.parse(input)
  }

  static parseOutput(output: any): boolean {
    return this.outputType.parse(output);
  }

  static equivalentInputs(first: any, second: any): boolean {
    return this.inputType.areEquivalent(first, second)
  }

  static equivalentOutputs(first: any, second: any): boolean {
    return this.outputType.areEquivalent(first, second)
  }

  static inputDisplayStr(input: number): string {
    return this.inputType.displayString(input)
  }

  static outputDisplayStr(output: boolean): string {
    return this.outputType.displayString(output)
  }

  static inputDBStr(input: number): string {
    return this.inputType.dbString(input)
  }

  static outputDBStr(output: boolean): string {
    return this.outputType.dbString(output)
  }
}

export default FirstIntoSecondDivisible