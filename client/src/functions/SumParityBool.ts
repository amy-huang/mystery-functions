import ListOfInteger from "../types/ListOfInteger";
import Bool from "../types/Bool";

class SumParityBool {
  static numArgs = 1
  static inputType = ListOfInteger
  static outputType = Bool

  static description(): string {
    return "SumParityBool"
  }

  static function(items: number[]): boolean {
    var sum = 0
    for (var i = 0; i < items.length; i++) {
      sum += items[i]
    }

    if (Math.abs(sum % 2) === 1) {
      return true
    }

    return false
  }

  static inputGenerators(): Function[] {
    return [() => { return [333] }, () => { return [-8, 3] }, () => { return [1, 0, 1] }]

  }

  static answerText(): string {
    return "This function returns 1 if the sum of the elements of the input list is odd and 0 if even."
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
    return this.inputType.valid(input)
  }

  static validOutput(input: any): boolean {
    return this.outputType.valid(input)
  }

  static parseInput(input: any): any[] {
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

  static inputDisplayStr(input: number[]): string {
    return this.inputType.displayString(input)
  }

  static outputDisplayStr(output: boolean): string {
    return this.outputType.displayString(output)
  }

  static inputDBStr(input: number[]): string {
    return this.inputType.dbString(input)
  }

  static outputDBStr(output: boolean): string {
    return this.outputType.dbString(output)
  }
}

export default SumParityBool