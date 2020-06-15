/**
 * This class is the Average function object, that allows for a mystery function
 * that takes in a list of integers and returns the average of them.
 */
import ListOfInteger from "../types/ListOfInteger";
import Float from "../types/Float";

class Average {
  static inputType = ListOfInteger
  static numArgs = 1
  static outputType = Float

  // Used as fcnname in the database
  static description(): string {
    return "Average"
  }

  // Actual function performed on inputs evaluated
  static function(items: number[]): number {
    var sum = 0
    items.forEach((elem) => { sum += elem })
    return sum / items.length
  }

  // Functions that return the inputs needed for the quiz questions
  static inputGenerators(): Function[] {
    return [() => { return [1, 8, 24] }, () => { return [8, 1, 24] }, () => { return [1, 2, 3, 14] }]
  }

  // Displayed once someone passes the entire quiz or gives up
  static answerText(): string {
    return "This function returns the average of the input list of numbers."
  }

  // Default input used to populate input submission text box in the evaluation screen
  // the first time the user opens it. Only type that needs this as of now is lists of integers: []
  static inputPlaceHolderText(): string {
    return this.inputType.placeholderText()
  }

  // Default output used to populate quiz question answer submission text box. None of the types 
  // needs this right now; all empty
  static outputPlaceHolderText(): string {
    return this.outputType.placeholderText()
  }

  // Displayed on the evaluation screen in the function signature to explain how to format input text
  static inputDescription(): string {
    return this.inputType.longDescription()
  }

  // Displayed on the evaluation screen in the function signature to explain how to format output text
  static outputDescription(): string {
    return this.outputType.longDescription()
  }

  // Returns whether an input string submitted by user is valid. If not, an alert pop up will appear
  // in the evaluation screen
  static validInput(input: any): boolean {
    var as_list;
    try {
      // Parse string as a list, with brackets required
      if (input.trim()[0] !== "[") {
        console.log("no starting bracket")
        return false;
      }
      as_list = JSON.parse(input);
      if (as_list.length > 0) {
        return ListOfInteger.valid(input)
      } else {
        return false
      }
    } catch (e) {
      console.log("error: ", e)
      return false;
    }
  }

  /* Should not have to touch functions below here! */

  static validOutput(input: any): boolean {
    return this.outputType.valid(input)
  }

  // Transforms text input to an array the function method can use
  static parseInput(input: any): any[] {
    return this.inputType.parse(input)
  }

  // Transforms text output to data that can be compared to the result of the function method
  static parseOutput(output: any): number {
    return this.outputType.parse(output);
  }

  // Returns whether the input strings are equal; used to see if an input is allowed to be evaluated
  static equivalentInputs(first: any, second: any): boolean {
    return this.inputType.areEquivalent(first, second)
  }

  // Returns whether the output strings are equal; used to see if a quiz question was answered correctly
  static equivalentOutputs(first: any, second: any): boolean {
    return this.outputType.areEquivalent(first, second)
  }

  // Used to format the input evaluated as a string for display in the evaluation screen console
  static inputDisplayStr(input: number[]): string {
    return this.inputType.displayString(input)
  }

  // Used to format the output evaluated as a string for display in the evaluation screen console
  static outputDisplayStr(output: number): string {
    return this.outputType.displayString(output)
  }

  // Formats the input as a string for storage in the database
  static inputDBStr(input: number[]): string {
    return this.inputType.dbString(input)
  }

  // Formats the output as a string for storage in the database
  static outputDBStr(output: number): string {
    return this.outputType.dbString(output)
  }
}

export default Average