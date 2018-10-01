var filePath = WScript.Arguments.Item(0);
memory = [];
var dmem = readJatFile(filePath);
appendMemory(dmem);
if (memory[0] == "function")
{
	memory.shift();
	memory.shift();
}

var eofIndex = -1;

for (var i = 0; i < memory.length; i++)
{
	if (typeof memory[i] == "string" && memory[i].indexOf("#") == 0)
	{
		memory[i] = "$" + memory[i].substring(1);
	}
	if (memory[i] == "eof")
	{
		eofIndex = i;
	}
}

if (eofIndex < 0)
{
	//end of file
	memory.push("eof");

	var eofIndex = memory.length;
}

//Starting setting functions
var funcArgCount = new ActiveXObject("Scripting.Dictionary");
registerFunction("read", 1);

registerFunction("write", 1);
registerFunction("write@", 1);
registerFunction("writeLn", 1);
registerFunction("writeLn@", 1);

registerFunction("goto", 1);

registerFunction("+", 2);
registerFunction("-", 2);

registerFunction("*", 2);
registerFunction("//", 3);
registerFunction("%", 3);
registerFunction("|", 3);

registerFunction("=", 2);

registerFunction("if", 3);
registerFunction("end", 0);
registerFunction("else", 1);
registerFunction("and", 3);
registerFunction("or", 3);
registerFunction("==", 3);
registerFunction("not", 2);

registerFunction(">", 3);
registerFunction(">=", 3);
registerFunction("<", 3);
registerFunction("<=", 3);

registerFunction("writeCounter", 0);

function registerFunction(id, argNum)
{
	funcArgCount.add(id, argNum);
}

function getArgCount(func)
{
	if (funcArgCount.Exists(func))
		return funcArgCount.Item(func);
	return 0;
}

//End setting Functions
var varStartIndex = memory.length + 50;

//allocated functions
var funcStartIndex = memory.length + 1050;

var counter = 0;
//Executing our code
while (memory[counter] != "eof" && counter < eofIndex)
{
	var func = memory[counter];
	//WSH.echo("[Debug][" + counter + "]: Function word: " + func);
	if (funcArgCount.Exists(func) || (typeof func == "string" && func.indexOf(":") == 0))
	{
		var argsCount = getArgCount(func);
		//WSH.echo("[Debug][" + counter + "]: Arg Count: " + argsCount);
		var args = [];
		for (var i = 1; i < argsCount + 1; i++)
		{
			args.push(memory[i + counter]);
		}
		call(func, args);
		counter += argsCount;
	}
	else
	{
		WSH.echo("[Error][" + counter + "]: Couldn't find function signature " + func + " words around are: [" + memory[counter - 1] + ", " + memory[counter + 1] + "]");
	}
	counter += 1;
}
if (memory[eofIndex + 1] == "default")
{
	for (var i = 2; i >= 21; i++)
	{
		WSH.echo("|" + memory[eofIndex + 1] + "|");
		var func = memory[eofIndex + i];
		var argsCount = getArgCount(func);
		WSH.echo("[Debug][" + eofIndex + i + "]: Arg Count: " + argsCount);
		var args = [];
		for (var j = 1; j < argsCount + 1; j++)
		{
			args.push(memory[j + i + eofIndex]);
		}
		call(func, args);
		i += argsCount;
	}
}

function call(id, args)
{
	switch (id)
	{
		case "read":
			read(args); break;
		case "write":
			write(args); break;
		case "write@":
			writeString(args); break;
		case "writeLn":
			writeLine(args); break;
		case "writeLn@":
			writeStringLine(args); break;
		case "goto":
			gotoLabel(args); break;
		case "+":
			plus(args); break;
		case "-":
			sub(args); break;
		case "*":
			mult(args); break;
		case "//":
			div(args); break;
		case "%":
			mod(args); break;
		case "|":
			divisibleOn(args); break;
		case "if":
			ifWrap(args); break;
		case "else":
			elseWrap(args); break;
		case "end":
			counter -= 1;
			break;
		case "=":
			set(args); break;
		case "and":
			and(args); break;
		case "or":
			or(args); break;
		case "==":
			equals(args); break;
		case ">":
			greater(args); break;
		case ">=":
			greaterOrEquals(args); break;
		case "<":
			less(args); break;
		case "<=":
			lessOrEquals(args); break;
		case "not":
			not(args); break;
	}
}

function varIndexFromWord(word)
{
	var val = +(word.indexOf("$") == 0 || word.indexOf("#") == 0 ? +word.substring(1) : +word);
	if (val == word)
	{
		if (word.indexOf("!") == 0)
			val = +word.substring(1) - varStartIndex;
	}
	return +val + varStartIndex;
}

function setVariable(a, value)
{
	if (isVariable(a))
	{
		memory[varIndexFromWord(a)] = value;
	}
	else
	{
		memory[a] = value;
	}
}

function read(arr)
{
	setVariable(arr[0], WScript.StdIn.ReadLine());
}
function write(arr)
{
	WScript.StdOut.Write(getValue(arr[0]) + " ");
}
function writeString(arr)
{
	WScript.StdOut.Write(arr[0] + " ");
}
function writeLine(arr)
{
	WSH.echo(getValue(arr[0]));
}
function writeStringLine(arr)
{
	WSH.echo(arr[0]);
}
function gotoLabel(arr)
{
	var a = arr[0];
	var i = 0;
	while (memory[i] != a && i < memory.length)
	{
		i++;
	}
	if (i == memory.length)
	{
		WSH.echo("[Warn]: Couldn't find label " + a);
	}
	else
		counter = i - 1;

}
function jumpTo(arr)
{
	var a = arr[0];
	var i = getValue(a);

	if (i >= memory.length)
	{
		WSH.echo("[Warn]: Couldn't jump to " + a);
	}
	else
		counter = i - 1;
}
function plus(arr)//a+=b
{
	setVariable(arr[0], +getValue(arr[0]) + getValue(arr[1]));
}
function sub(arr)//a+=b
{
	setVariable(arr[0], +getValue(arr[0]) - getValue(arr[1]));
}
function mult(arr)//a*=b
{
	setVariable(arr[0], +getValue(arr[0]) * getValue(arr[1]));
}
function div(arr)
{
	var a = getValue(arr[0]);
	var b = getValue(arr[1]);
	setVariable(arr[2], (a - (a % b)) / b);
}
function divisibleOn(arr)
{
	setVariable(arr[2], (+getValue(arr[0]) % +getValue(arr[1]) == 0));
}
function mod(arr)
{
	setVariable(arr[2], (+getValue(arr[0]) % +getValue(arr[1])));
}
function set(arr)// a=b
{
	setVariable(arr[0], (+getValue(arr[1])));
}

function ifWrap(arr)
{
	var elseif = +arr[0];
	var b = parseBoolean(arr[2]);
	if (!b)
	{
		counter = elseif;
	}
}

function elseWrap(arr)
{
	var eif = arr[0];
	counter = eif;
}

function and(arr)// a*b
{
	setVariable(arr[2], 0 + (parseBoolean(arr[0]) & parseBoolean(arr[1])));
}

function or(arr)// a+b
{
	setVariable(arr[2], 0 + (parseBoolean(arr[0]) | parseBoolean(arr[1])));
}

function equals(arr)
{
	setVariable(arr[2], 0 + (parseBoolean(arr[0]) == parseBoolean(arr[1])));
}

function greater(arr)
{
	setVariable(arr[2], 0 + (+getValue(arr[0]) > +getValue(arr[1])));
}
function greaterOrEquals(arr)
{
	setVariable(arr[2], 0 + (+getValue(arr[0]) >= +getValue(arr[1])));
}

function less(arr)
{
	setVariable(arr[2], 0 + (+getValue(arr[0]) < +getValue(arr[1])));
}
function lessOrEquals(arr)
{
	setVariable(arr[2], 0 + (+getValue(arr[0]) <= +getValue(arr[1])));
}

function not(arr)
{
	setVariable(arr[1], 0 + !(parseBoolean(arr[0])));
}
var maxReturnedValues = 10;
function allocateFunction(arr)
{
	var funcName = arr[0];
	var b = varIndexFromWord(arr[1]);
	var funcToMemory = readJatFile(funcName);
	var argCount = funcToMemory[1];

	funcToMemory.shift();
	funcToMemory.shift();

	var funcBodyStart = Math.max(memory.length, funcStartIndex);
	var funcStart = funcBodyStart + 4 + argCount;
	var varStart = funcBodyStart + 4 + argCount + funcToMemory.length + 2;
	memory.push(funcName);//0
	memory.push(argCount);//1

	var meta = memory.length;//varStartIndex
	memory.push("funcStart");//2
	memory.push("varStart");//3
	memory.push("retStart");//4
	memory.push("nextFunc");//5
	for (var i = 0; i < argCount; i++)//input //6
	{
		memory.push("$" + i);//argument values should be wrote here
	}

	var maxVariableNumber = 0;
	for (var i = 0; i < funcToMemory.length; i++)
	{
		var funcWord = funcToMemory[i];
		if (typeof funcWord == "string" && funcWord.indexOf("#") == 0)
		{
			var num = +funcWord.substring(1);
			if (num > maxVariableNumber)
				maxVariableNumber = num;
			funcToMemory[i] = "$" + (num + varStart);
		}
		if (funcWord == "return")//injecting Set function
		{
			funcToMemory[i] = "=";//set
			funcToMemory[i + 1] = "!" + (+retStart + funcToMemory[i + 1]);//link to value storage
			funcToMemory[i + 2] = "$"(+varStart + varIndexFromWord(funcToMemory[i + 2]));//value to get
			i += 2;
		}
		if (funcWord == "assign")//injecting Set function
		{
			funcToMemory[i] = "=";//set
			funcToMemory[i + 1] = "!" + (+funcBodyStart + 6 + varIndexFromWord(funcToMemory[i + 1]));//link to value storage
			funcToMemory[i + 2] = "$" + (+varStart + varIndexFromWord(funcToMemory[i + 2]));//value to get
			i += 2;
		}
	}
	appendMemory(funcToMemory);
	memory.push("jumpTo");//7+argCount
	memory.push("callIndex");// index where return to //8+argCount

	var retStart = varStart + maxVariableNumber;
	var nextFuncIndex = retStart + maxReturnedValues;
	memory[meta + 0] = funcStart;
	memory[meta + 1] = varStart;
	memory[meta + 2] = retStart;
	memory[meta + 3] = nextFuncIndex;
}
function readReturn(arr)
{
	var func = getValue(arr[0]);//function start
	var retStart = +memory[func + 4];
	var returnIndex = getValue(arr[1]);
	var saveIndex = varIndexFromWord(arr[2]);
	memory[saveIndex] = returnValue;
}
function appendMemory(dMem)
{
	for (var i = 0; i < dmem.length; i++)
	{
		memory.push(dmem[i]);
	}
}
function callFunction(arr)
{
	var funcBodyStart = varIndexFromWord(arr[0]);
	var argCount = +memory[funcBodyStart + 1];
	var funcStart = +memory[funcBodyStart + 2];
	var varStart = +memory[funcBodyStart + 3];

	var argStartIndex = funcBodyStart + 6;

	for (var i = 0; i < argCount; i++)//setting up arguments
	{
		memory[i + argStartIndex] = arr[1 + i];
	}

	memory[varStart - 1] = counter + argCount - 200;

	counter = funcStart - 200 - 1 - argCount;
}

function parseBoolean(a)
{
	if (typeof a == "boolean")
	{
		return a;
	}
	if (isVariable(a))
	{
		a = getValue(a);
	}
	if (a == "b1" || a == "true" || a == "1")
	{
		return true;
	}
	return false;
}

function isVariable(a)
{
	return typeof a == "string" && (a.charAt(0) == "!" || a.charAt(0) == "@" || a.charAt(0) == "#" || a.charAt(0) == "$");
}
function getValue(a)
{
	if (isVariable(a))
	{
		return +memory[varIndexFromWord(a)];
	}
	return +a;
}

function trim(s)
{
	var ret = "";
	for (var i = 0; i < s.length; i++)
	{
		if (i == 0 || (s.charAt(i) != "\t" && s.charAt(i) != " " || s.charAt(i - 1) != " "))
		{
			ret += s.charAt(i);
		}
	}
	return ret;
}

function readJatFile(filePath)
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var ts = fso.OpenTextFile(filePath);//code file
	var dmemory = [];

	while (!ts.AtEndOfStream)
	{
		var commenting = false;
		var line = ts.readLine();
		var words = line.split(" ");
		for (var i = 0; i < words.length; i++)
		{
			word = trim(words[i]);
			if (word.indexOf("##") > -1)
			{
				commenting = true;
			}
			if (!commenting)
			{
				if (word == "default")
				{
					dmemory.push("eof");
				}
				dmemory.push(word);
				if (word == "if")
				{
					dmemory.push("elseif");
					dmemory.push("endif");
				}
				if (word == "else")
				{
					dmemory.push("endif");
					for (var j = dmemory.length - 1; j >= 0; j--)
					{
						if (dmemory[j] == "elseif")
						{
							dmemory[j] = dmemory.length - 4;
						}
					}
				}
				if (word == "end")
				{
					for (var j = dmemory.length - 1; j >= 0; j--)
					{
						if (dmemory[j] == "elseif")
						{
							dmemory[j] = dmemory.length - 4;
						}
						if (dmemory[j] == "endif")
						{
							dmemory[j] = dmemory.length - 4;
						}
					}
				}
			}
			if (word == "#")
			{
				commenting = false;
			}
		}
	}
	ts.Close();
	return dmemory;
}