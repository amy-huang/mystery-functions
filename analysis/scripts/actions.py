import enum
from typing import *
from math import floor

class Action:
	def __init__(self, key, time):
		self.key = key
		self.time = time

class EvalInput(Action):
	def setInputOutput(self, inp, outp):
		self.input = inp
		self.output = outp

	def __str__(self):
		return "{} -> {}".format(self.input, self.output)

class QuizQ(Action):
	def setQ(self, quizNo, question, given, actual, result):
		self.quizNo = quizNo
		self.question = question
		self.given = given
		self.actual = actual
		self.result = result

	def __str__(self):
		return "QuizAnswer: [{}]	{} -> {}, actual {} {}".format(self.quizNo, self.question, self.given, self.actual, self.result)

class FinalAnswer(Action):
	def setGuess(self, guess):
		self.guess = guess
		self.tags = []

	def __str__(self):
		return "FinalGuess: {}".format(self.guess)

	def addTags(self, tags):
		self.tags += tags

###################################################

class QuizAttempt(Action):
	def __init__(self):
		self.responses = []
		self.answer = ""

	def __str__(self):
		res = ""
		for resp in self.responses:
			res += "	{}\n".format(resp)
		res += "	{}\n".format(self.answer)
		return res

	def setAnswer(self, answer):
		self.answer = answer

	def addQuizQ(self, quizQ):
		self.responses.append(quizQ)

###################################################

class ActionType(enum.Enum):
	EvalInput = 0
	QuizQ = 1
	FinalAnswer = 2

class SectionCounter:
	evalInputNum = 0
	quizAttemptNum = 0

	def nextEvalInputSection(self):
		name = "e" + str(self.evalInputNum)
		self.evalInputNum += 1
		return name

	def nextQuizAttemptSection(self):
		name = "q" + str(self.quizAttemptNum)
		self.quizAttemptNum += 1
		return name	

class FunctionAttempt:
	def __init__(self, name):
		self.name = name
		self.sectionOrder = []
		self.EIs = {} # string name to list of eval inputs
		self.QAs = {} # string name to quiz attempts
		self.sectionType = None
		self.currSection = ""
		self.counter = SectionCounter()
		self.finalAnswer = None
		self.evalSectionLens = []

	def __str__(self):
		res = ""
		for section in self.sectionOrder:
			if section[0] == "e":
				for ei in self.EIs[section]:
					res += "	{}\n".format(ei)
			else:
				res += "{}\n".format(self.QAs[section])
		return res

	def addEvalInput(self, evalInput: EvalInput):
		# Start new eval input section if necessary
		if self.sectionType != ActionType.EvalInput:
			self.sectionType = ActionType.EvalInput
			self.currSection = self.counter.nextEvalInputSection()
			self.sectionOrder.append(self.currSection)
			self.EIs[self.currSection] = []

			self.evalSectionLens.append(0)

		# Add new eval input
		self.EIs[self.currSection].append(evalInput)
		self.evalSectionLens[-1] = self.evalSectionLens[-1] + 1

	def addQuizQ(self, quizQ: QuizQ):
		# Start new section if necessary
		if self.sectionType == ActionType.EvalInput or self.sectionType == None:
			self.sectionType = ActionType.QuizQ
			self.currSection = self.counter.nextQuizAttemptSection()
			self.sectionOrder.append(self.currSection)
			self.QAs[self.currSection] = QuizAttempt()

		# Add new quiz question
		self.sectionType = ActionType.QuizQ # In case was final answer before
		self.QAs[self.currSection].addQuizQ(quizQ)

	def addFinalAnswer(self, finalAnswer: FinalAnswer):
		if self.finalAnswer != None:
			print("WARNING: another final answer given for this fcn")
		self.finalAnswer = finalAnswer

	def allEvals(self):
		res = []
		for section in self.sectionOrder:
			if section[0] == "e":
				for ei in self.EIs[section]:
					res.append(ei)
		return res

	def quizAttemptIndices(self):
		currIdx = 0
		res = []
		for section in self.sectionOrder:
			if section[0] == "e":
				currIdx += len(self.EIs[section])
			if section[0] == "q":
				res.append(currIdx)
		return res

	def addAnswerTags(self, tags):
		if self.finalAnswer == None:
			print("no final answer ")
			return
		self.finalAnswer.addTags(tags)

	def answerTags(self):
		if self.finalAnswer != None:
			return self.finalAnswer.tags
		return None

	def allActions(self):
		return self.sectionOrder, self.EIs, self.QAs

###################################################

class Subject:
	def __init__(self, ID):
		self.ID = ID
		self.functionAttempts = {} # Map fcn names to the section
		self.FAsInOrder = []
		self.subjectPool = ""

	def __str__(self):
		res = "Subject {}\n".format(self.ID)
		for fcn in self.functionAttempts:
			res += "{}\n".format(fcn)
			res += "{}\n".format(self.functionAttempts[fcn])
		return res

	# Record name of subject pool ("IU" or "32")
	def addSubjectPool(self, pool: str):
		self.subjectPool = pool

	def addEvalInput(self, fcnName: str, evalInput: EvalInput):
		if fcnName not in self.functionAttempts:
			self.functionAttempts[fcnName] = FunctionAttempt(fcnName)
			self.FAsInOrder.append(self.functionAttempts[fcnName])
		self.functionAttempts[fcnName].addEvalInput(evalInput)

	def addQuizQ(self, fcnName: str, quizQ: QuizQ):
		if fcnName not in self.functionAttempts:
			self.functionAttempts[fcnName] = FunctionAttempt(fcnName)
			self.FAsInOrder.append(self.functionAttempts[fcnName])
		self.functionAttempts[fcnName].addQuizQ(quizQ)

	def addFinalAnswer(self, fcnName: str, finalAnswer: FinalAnswer):
		if fcnName not in self.functionAttempts:
			self.functionAttempts[fcnName] = FunctionAttempt(fcnName)
			self.FAsInOrder.append(self.functionAttempts[fcnName])
		self.functionAttempts[fcnName].addFinalAnswer(finalAnswer)

	def addAnswerTags(self, fcnName: str, tags):
		self.functionAttempts[fcnName].addAnswerTags(tags)

	def fcnNames(self):
		return [FA.name for FA in self.FAsInOrder]

	def fcnScore(self, fcn):
		tags = self.functionAttempts[fcn].answerTags()
		if tags == None:
			return 0

		rating = 0
		if "COR" in tags:
			rating = 4
		elif "MCOR" in tags:
			rating = 3
		elif "SCOR" in tags:
			rating = 2
		elif "XCOR" in tags:
			rating = 1
		else:
			return 0
		return rating

	def answerTagsByOrder(self):
		ratingsInOrder = []
		for FA in self.FAsInOrder:
			tags = FA.answerTags()
			rating = None
			if tags == None:
				# ratingsInOrder.append(0)
				continue

			if "COR" in tags:
				rating = 4
			elif "MCOR" in tags:
				rating = 3
			elif "SCOR" in tags:
				rating = 2
			elif "XCOR" in tags:
				rating = 1
			else:
				# rating = 0
				continue

			ratingsInOrder.append(rating)
		return ratingsInOrder

	def ratingsByFcn(self):
		fcnToRating = {}
		for FA in self.FAsInOrder:
			tags = FA.answerTags()
			rating = None
			if tags == None:
				# ratingsInOrder.append(0)
				continue

			if "COR" in tags:
				rating = 4
			elif "MCOR" in tags:
				rating = 3
			elif "SCOR" in tags:
				rating = 2
			elif "XCOR" in tags:
				rating = 1
			else:
				# rating = 0
				continue

			fcnToRating[FA.name] = rating
		return fcnToRating

	def getAnswerTags(self, fcnName: str):
		if fcnName in self.functionAttempts:
			return self.functionAttempts[fcnName].answerTags()
		return None

	def printAnswerTags(self):
		tags = ""
		for fcn in self.functionAttempts.keys():
			tags += "{}: {}\n".format(fcn, self.functionAttempts[fcn].answerTags())
		return tags

	def getFcnDistro(self):
		names = []
		for FA in self.FAsInOrder:
			names.append(FA.name)
		return names

	def didFcn(self, name):
		if name in self.functionAttempts:
			return True
		return False

	def allFcnActions(self, name):
		if name in self.functionAttempts:
			return self.functionAttempts[name].allActions()
		return None, None, None

	def getEvalLens(self, fcn):
		if fcn in self.functionAttempts:
			return self.functionAttempts[fcn].evalSectionLens
		return None

#################################################################################

# Keeps track of the lengths of input evaluation traces, # of quiz attempts, 
# # of inputs evaluated between quiz attempts, and the highest edit distance
# seen between consecutive inputs - 
# for a single correctness rating kept by DistributionKeeper
class Distributions:
	def __init__(self, ID):
		self.ID = ID
		self.traceLens = {}
		self.quizAttempts = {}
		self.EIsbetweenQAs = {}
		self.highestInputDiff = {}

	def __str__(self):
		res = "Distributions for {}\n".format(self.ID)

		res += ("Num of inputs evaluated\n")
		for i in range(sorted(self.traceLens.keys())[-1] + 1):
			if i in self.traceLens:
				res += "{}, {},\n".format(i, self.traceLens[i])
			else:
				res += "{}, {},\n".format(i, 0)

		res += ("Highest input diffs\n")
		for i in range(sorted(self.highestInputDiff.keys())[-1] + 1):
			if i in self.highestInputDiff:
				res += "	{}, {},\n".format(i, self.highestInputDiff[i])
				
		res += ("# quiz attempts\n")
		# Report average # quiz attempts, and % over 1
		sum = 0
		multipleAttempts = 0
		numSubs = 0
		for k in sorted(self.quizAttempts.keys()):
			curr = self.quizAttempts[k]
			sum += curr
			numSubs += 1
			if curr > 1:
				multipleAttempts += 1
			res += "	{}, {},\n".format(k, curr)
		res += "Average {} % multiple attempts {}\n".format(sum/numSubs, (100 * multipleAttempts)/numSubs)

		res += "Inputs evaluated between quiz attempts\n"
		for k in sorted(self.EIsbetweenQAs.keys()):
			res += "	{}, {},\n".format(k, self.EIsbetweenQAs[k])

		return res

	def printHighestDiffs(self):
		res = ""
		diffs = []
		for diff in sorted(self.highestInputDiff.keys()):
			freq = self.highestInputDiff[diff]
			for _ in range(freq):
				diffs.append(diff)
		median = sorted(diffs)[floor(len(diffs)/2)]
		res += "Median highest diff {}\n".format(median)
		return res

	def printFirstStretchStats(self):
		all = []
		sum = 0
		numSubs = 0
		for ID in sorted(self.EIsbetweenQAs.keys()):
			stretchLens = self.EIsbetweenQAs[ID]
			if len(stretchLens):
				all.append(stretchLens[0])
				sum += stretchLens[0]
				numSubs += 1
		median = sorted(all)[floor(len(all)/2)]
		return "{}, {},\n".format(median, sum/numSubs)

	def printEIsBwQAs(self):
		res = ""
		for k in sorted(self.EIsbetweenQAs.keys()):
			res += "{}, ".format(k)
			for stretch in self.EIsbetweenQAs[k]:
				res += "{}, ".format(stretch)
			res += "\n"

		return res

	def printMedianQuizAttempts(self):
		allNumAttempts = []
		res = ""
		sum = 0
		numSubs = 0
		for numAttempts in sorted(self.quizAttempts.keys()):
			freq = self.quizAttempts[numAttempts]
			for _ in range(freq):
				sum += numAttempts
				numSubs += 1
				allNumAttempts.append(numAttempts)
		median = 0
		avg = 0
		if len(allNumAttempts) > 0:
			median = sorted(allNumAttempts)[floor(len(allNumAttempts)/2)]
			avg = sum/numSubs
		res += "Median quiz attempts {}\n".format(median)
		res += "Average quiz attempts {}\n".format(avg)
		return res

	def printMedianEvals(self):
		allNumEvals = []
		# res = ""
		sum = 0
		numSubs = 0
		# print("duds", self.traceLens[0] + self.traceLens[1])
		for numEvals in sorted(self.traceLens.keys()):
			freq = self.traceLens[numEvals]
			for _ in range(freq):
				sum += numEvals
				numSubs += 1
				allNumEvals.append(numEvals)
		median = sorted(allNumEvals)[floor(len(allNumEvals)/2)]
		# res += "Median # evals {}\n".format(median)
		# res += "Average # evals {}\n".format(sum/numSubs)
		return "{}, {},\n".format(median, sum/numSubs)

	def addNumEvals(self, numEvals):
		if numEvals not in self.traceLens:
			self.traceLens[numEvals] = 0
		self.traceLens[numEvals] = self.traceLens[numEvals] + 1
		# print("Added to trace len of {} frequency {} \n".format(numEvals, self.traceLens[numEvals]))

	def addQuizAttempts(self, attempts):
		if attempts not in self.quizAttempts:
			self.quizAttempts[attempts] = 0
		self.quizAttempts[attempts] = self.quizAttempts[attempts] + 1

	def addMaxDiff(self, diff):
		if diff not in self.highestInputDiff:
			self.highestInputDiff[diff] = 0
		self.highestInputDiff[diff] = self.highestInputDiff[diff] + 1

	def addEIsBwQAs(self, ID: str, evalLens):
		if ID in self.EIsbetweenQAs:
			print("WARNING: EI section lengths being re-assigned")
		self.EIsbetweenQAs[ID] = evalLens

# Keeps track of distributions correctness rating
class DistributionKeeper:
	def __init__(self):
		self.ratingsToDistros = {}
		self.ratingsToDistros["COR"] = Distributions("COR")
		self.ratingsToDistros["MCOR"] = Distributions("MCOR")
		self.ratingsToDistros["SCOR"] = Distributions("SCOR")
		self.ratingsToDistros["XCOR"] = Distributions("XCOR")

	def __str__(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			res += "Rating {} distributions:\n".format(rating)
			res += str(self.ratingsToDistros[rating])
		return res

	def highestDiffs(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			res += "Rating {}\n".format(rating)
			res += self.ratingsToDistros[rating].printHighestDiffs()
		return res

	def EIsBwQAs(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			# res += "Rating {} EIs bw QAs\n".format(rating)
			res += self.ratingsToDistros[rating].printEIsBwQAs()
		return res

	def quizAttempts(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			res += "Rating {} quiz attempts\n".format(rating)
			res += self.ratingsToDistros[rating].printMedianQuizAttempts()
		return res

	def numEvals(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			res += "{}, {}".format(rating, self.ratingsToDistros[rating].printMedianEvals())
		return res

	# Prints average and median length of first stretch of inputs evaluation before first quiz attempt
	def firstStretchStats(self):
		res = ""
		for rating in sorted(self.ratingsToDistros):
			res += "{}, {}".format(rating, self.ratingsToDistros[rating].printFirstStretchStats())
		return res
	
	def addNumEvals(self, rating, numEvals):
		if rating not in self.ratingsToDistros:
			self.ratingsToDistros[rating] = Distributions(rating)
		self.ratingsToDistros[rating].addNumEvals(numEvals)

	def addQuizAttempts(self, rating, attempts):
		if rating not in self.ratingsToDistros:
			self.ratingsToDistros[rating] = Distributions(rating)
		self.ratingsToDistros[rating].addQuizAttempts(attempts)

	def addMaxDiff(self, rating, diff):
		if rating not in self.ratingsToDistros:
			self.ratingsToDistros[rating] = Distributions(rating)
		self.ratingsToDistros[rating].addMaxDiff(diff)

	def addEIsBwQAs(self, rating, ID: str, evalLens):
		if rating not in self.ratingsToDistros:
			self.ratingsToDistros[rating] = Distributions(rating)
		self.ratingsToDistros[rating].addEIsBwQAs(ID, evalLens)

#########################################################################

# Keeps a TagsByCorrectness for each function, so that the printout can show
# the frequencies of answer tags by correctness rating for each function
class TagsByFcn:
	def __init__(self):
		self.tagKeepers = {}

	def __str__(self):
		res = ""
		for fcn in self.tagKeepers:
			res += "Function {}\n".format(fcn)
			res += str(self.tagKeepers[fcn])
		return res

	def addTags(self, fcn, tags):
		if fcn not in self.tagKeepers:
			self.tagKeepers[fcn] = TagsByCorrectness(fcn)
		self.tagKeepers[fcn].addTags(tags)


# Keeps track of function guess tag frequencies by correctness rating
class TagsByCorrectness:
	def __init__(self, fcn):
		self.fcn = fcn
		self.CORs = {}
		self.MCORs = {}
		self.SCORs = {}
		self.XCORs = {}

	def __str__(self):
		# lines = "Tags for {}\n".format(self.fcn)
		lines = ""
		for tag in sorted(self.CORs.keys()):
			lines += "{}, {}, {},\n".format("COR", tag, self.CORs[tag])
		for tag in sorted(self.MCORs.keys()):
			lines += "{}, {}, {},\n".format("MCOR", tag, self.MCORs[tag])
		for tag in sorted(self.SCORs.keys()):
			lines += "{}, {}, {},\n".format("SCOR", tag, self.SCORs[tag])
		for tag in sorted(self.XCORs.keys()):
			lines += "{}, {}, {},\n".format("XCOR", tag, self.XCORs[tag])
		return lines
	
	def addTags(self, tags):
		ratingDict = {}
		if "COR" in tags:
			ratingDict = self.CORs
		elif "MCOR" in tags:
			ratingDict = self.MCORs
		elif "SCOR" in tags:
			ratingDict = self.SCORs
		elif "XCOR" in tags:
			ratingDict = self.XCORs
		else:
			print("Error: no rating in tags from a subject")
		for tag in tags:
			if tag == "COR" or tag == "MCOR" or tag == "SCOR" or tag == "XCOR":
				continue
			if tag not in ratingDict:
				ratingDict[tag] = 0
			ratingDict[tag] = ratingDict[tag] + 1

# Keeps track of the completion and correctness ratings for one subject
# Records the functions completed in order, so if that information is desired,
# adding functions to reveal those functions can use the fcnNames array
class SubKeeper:
	def __init__(self, ID):
		self.ID = ID
		self.fcnNames = []
		self.compRatings = []
		self.corRatingsFull = []
		self.corRatingsCollapsed = []

	# Print csv line of completion ratings
	def comps(self):
		line = "{}, ".format(self.ID)
		for rating in self.compRatings:
			line += "{}, ".format(rating)
		return line

	# Print csv lin of correctness ratings
	# Includes 0s for functions not completed but skipped
	# So scores could be 3, 0, 1 if 3 functions were attempted
	# but only the first and last were completed
	def corsFull(self):
		line = "{}, ".format(self.ID)
		for rating in self.corRatingsFull:
			line += "{}, ".format(rating)
		return line

	# Print csv lin of correctness ratings
	# Does not include 0s for functions not completed;
	# all scores are 1 to 4 inclusive
	def corsCollapsed(self):
		line = "{}, ".format(self.ID)
		for rating in self.corRatingsCollapsed:
			line += "{}, ".format(rating)
		return line

	def addCompRating(self, fcn, rating: str):
		self.fcnNames.append(fcn)
		self.compRatings.append(rating)

	def addCorRating(self, fcn, rating: int):
		self.fcnNames.append(fcn)
		self.corRatingsCollapsed.append(rating)

# Keeps track of the completion and correctness ratings by function
class FcnKeeper:
	def __init__(self):
		self.compRatings = {}
		self.corRatings = {}

	# Prints out completion ratings for each function
	def comps(self):
		line = ""
		for fcn in self.compRatings:
			line += "{}, ".format(fcn)
			for rating in sorted(self.compRatings[fcn].keys()):
				line += "{}, ".format(self.compRatings[fcn][rating])
			line += "\n"
		return line

	# Prints out correctness ratings for each function
	def cors(self):
		line = ""
		for fcn in self.corRatings:
			line += "{}, ".format(fcn)
			# Lowest to highest ratings, 0 to 4
			for rating in sorted(self.corRatings[fcn].keys()):
				line += "{}, ".format(self.corRatings[fcn][rating])
			line += "\n"
		return line
	
	def addCompRating(self, fcn, rating: str):
		# Create dict if not existing 
		if fcn not in self.compRatings:
			self.compRatings[fcn] = { "NONS": 0, "IDK": 0, "NORM": 0 }
		self.compRatings[fcn][rating] += 1

	def addCorRating(self, fcn, rating: int):
		# Create dict if not existing 
		if fcn not in self.corRatings:
			self.corRatings[fcn] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
		self.corRatings[fcn][rating] += 1

# Keeps track of correctness ratings and completion ratings (well-formedness)
# by subject and by function
class FcnSubDivider:
	def __init__(self):
		self.subs = {} 
		self.fcns = FcnKeeper()

	def __str__(self):
		result = ""

		result += "Completion scores for each subject\n"
		result += "Subject ID, 1st function completed, 2nd, 3rd, 4th\n"
		for ID in self.subs:
			result += "{}\n".format(self.subs[ID].comps())
		
		result += "Completion labels by function \n"
		result += "Function, IDK, NONS, NORM\n"
		result += "{}\n".format(self.fcns.comps())

		result += "Correctness scores by function\n"
		result += "Function, 0, 1, 2, 3, 4\n"
		result += "{}\n".format(self.fcns.cors())
		return result

	# Adds completion rating: IDK, NONS, or NORM
	def addCompRating(self, ID, fcn, rating: str):
		# Create SubKeeper for the subject if not existing already
		if ID not in self.subs:
			self.subs[ID] = SubKeeper(ID)

		# Add the rating to both keepers
		self.subs[ID].addCompRating(fcn, rating)
		self.fcns.addCompRating(fcn, rating)

	# Adds correctness rating: 1 to 4
	def addCorRating(self, ID, fcn, rating: int):
		if ID not in self.subs:
			self.subs[ID] = SubKeeper(ID)

		# Add the rating to both keepers
		self.subs[ID].addCorRating(fcn, rating)
		self.fcns.addCorRating(fcn, rating)