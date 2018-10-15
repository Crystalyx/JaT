var filePath = WScript.Arguments.Item(0);
memory = [];

var counter = 0;

var doShift = true;

var maxArrInputSize = 256;
//Starting setting functions
var funcArgCount = new ActiveXObject("Scripting.Dictionary");
registerFunction("read", 1);

registerFunction("write", 1);
registerFunction("write@", 1);
registerFunction("write$", 200);
registerFunction("writeLn", 1);
registerFunction("writeLn@", 1);
registerFunction("writeLn$", 200);

registerFunction("goto", 1);

registerFunction("+", 2);
registerFunction("-", 2);

registerFunction("*", 2);
registerFunction("//", 3);
registerFunction("%", 3);
registerFunction("|", 3);

registerFunction("=", 2);

registerFunction("if", 2);
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

registerFunction("isInteger", 2);
registerFunction("isInfinite", 2);
registerFunction("nextInt", 1);
registerFunction("fact", 2);
registerFunction("writeMemory", 0);
registerFunction("flushMemory", 0);
registerFunction("removeVariable", 1);
registerFunction("loadFile", 1);
registerFunction("toFile", 201);
registerFunction("deleteFile", 1);
registerFunction("createFile", 1);
registerFunction("appendFile", 201);

registerFunction("writeCounter", 0);
registerFunction("shiftVariables", 1);
registerFunction("clrscr", 0);

var consoleMode = false;
var closedWrite = true;
var systemStopped = false;
if (filePath == "console")
{
	consoleMode = true;
	var varStartIndex = 210;

	WScript.StdOut.write("$>");
	var funcWord = trim(WScript.StdIn.ReadLine());
	while (funcWord != "stopConsole")
	{
		if (funcWord != "")
		{
			var words = funcWord.split(" ");
			var di = 0;
			var ifInsideId = 0;
			for (var i = 0; i < varStartIndex - 10; i++)
			{
				memory[i + di] = words[i];
				if (memory[i] == "if")
				{
					ifInsideId += 1;
					memory[i + 1 + di] = "exitPos_" + ifInsideId;
					di += 1;
					//WSH.echo("ifexitPos_" + ifInsideId);
					continue;
				}
				if (memory[i] == "else")
				{
					memory[i + 1 + di] = "exitPos_" + ifInsideId;
					di += 1;
					var pos = memory.length;
					//WSH.echo("elsexitPos_" + ifInsideId);

					for (var j = pos - 2; j >= 0; j--)
					{
						if (memory[j] == "exitPos_" + ifInsideId)
						{
							memory[j] = pos;
						}
					}
					continue;
				}
				if (memory[i] == "end")
				{
					var pos = memory.length;

					//WSH.echo("endexitPos_" + ifInsideId);
					for (var j = pos; j >= 0; j--)
					{
						if (memory[j] == "exitPos_" + ifInsideId)
						{
							memory[j] = pos;
						}
					}
					ifInsideId -= 1;
					continue;
				}
			}
			if (typeof memory[varStartIndex - 10] != "undefined")
			{
				WSH.echo("[ERROR] You should expand your command space or your programm will not work properly");
			}
			var memlength = memory.length;
			while (memory[counter] != "eof" && typeof memory[counter] != "undefined" && counter < memlength && !systemStopped)
			{
				var func = memory[counter];
				if (typeof func == "string" && isVariable(func))
				{
					WSH.echo(getValue(func));
				}
				else
					if (typeof func == "string" && func.indexOf(":") == 0)
					{
					}
					else
						if (funcArgCount.Exists(func))
						{
							var argsCount = getArgCount(func);
							var args = [];
							var dcounter = collectArguments(args, argsCount, counter);
							call(func, args);
							if (doShift)
								counter += argsCount + dcounter;
						}
						else
						{
							WSH.echo("[Error][" + counter + "]: Couldn't find function signature \"" + func + "\"");
						}
				if (doShift)
					counter += 1;
				doShift = true;
			}
		}
		var dmm = [];
		for (var i = varStartIndex; i < memory.length; i++)
		{
			dmm[i] = memory[i];
		}
		memory = dmm;
		counter = 0;
		if (!closedWrite)
		{
			WSH.echo();
			closedWrite = true;
		}
		WScript.StdOut.write("$>");
		funcWord = trim(WScript.StdIn.ReadLine());
	}
	systemStopped = true;
	WSH.echo("End of Console. Goodbye");
}

if (!systemStopped)
{
	var dmem = readJatFile(filePath);
	appendMemory(dmem);
	/**if (memory[0] == "function")
	{
		memory.shift();
		memory.shift();
	}*/

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

		var eofIndex = memory.length - 1;
	}

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

	//Executing our code
	while (memory[counter] != "eof" && counter < eofIndex)
	{
		var func = memory[counter];
		//WSH.echo("[Debug][" + counter + "]: Function word: " + func);
		if (funcArgCount.Exists(func) || (typeof func == "string" && func.indexOf(":") == 0))
		{
			var argsCount = getArgCount(func);
			var args = [];
			var dcounter = collectArguments(args, argsCount, counter);
			call(func, args);
			if (doShift)
				counter += argsCount + dcounter;
		}
		else
		{
			WSH.echo("[Error][" + counter + "]: Couldn't find function signature " + func + " words around are: [" + memory[counter - 1] + ", " + memory[counter + 1] + "]");
		}
		if (doShift)
			counter += 1;
		doShift = true;
	}
	if (memory[eofIndex + 1] == "default")
	{
		var i = 2;
		while (memory[eofIndex + i] != "defaultend" && memory[eofIndex + i] != undefined)
		{
			var func = memory[eofIndex + i];
			if (funcArgCount.Exists(func) || (typeof func == "string" && func.indexOf(":") == 0))
			{
				var argsCount = getArgCount(func);
				var args = [];
				var dcounter = collectArguments(args, argsCount, counter);
				call(func, args);
				if (doShift)
					counter += argsCount + dcounter;
			}
			else
			{
				WSH.echo("[Error][" + eofIndex + i + "]: Couldn't find function signature " + func + " words around are: [" + memory[eofIndex + i - 1] + ", " + memory[eofIndex + i + 1] + "]");
			}
			if (doShift)
				i++;
			doShift = true;
		}
	}

	function collectArguments(args, argsCount, counter)
	{
		var d = 0;
		for (var i = 1; i < argsCount + 1; i++)
		{
			if (memory[i + counter + d] == "[" || (memory[i + counter + d].indexOf("[") == 0 && memory[i + counter + d].length > 1))
			{
				var arrCounter = 0;
				var arrArgs = [];
				if (memory[i + counter + d].indexOf("[") == 0 && memory[i + counter + d].length > 1)
				{
					if (memory[i + counter + d].indexOf("]") == -1)
					{
						arrArgs.push(memory[i + counter + d].substring(1));
					}
					else
					{
						arrArgs.push(memory[i + counter + d].substring(1, memory[i + counter + d].length - 1));
						args.push(arrArgs);
						break;
					}
				}
				d++;
				while (memory[i + counter + d] != "]" && arrCounter < maxArrInputSize)
				{
					if (memory[i + counter + d].indexOf("]") != -1)
					{
						arrArgs.push(memory[i + counter + d].substring(0, memory[i + counter + d].length - 1));
						d--;
						break;
					}
					arrArgs.push(memory[i + counter + d]);
					d++;
					arrCounter++;
				}
				d++;
				if (arrCounter >= maxArrInputSize)
				{
					WSH.echo("[ERROR] ArraySizeOutOfBoundException(" + (counter + d) + ") : ArraySize " + arrCounter + " > " + maxArrInputSize);
				}
				args.push(arrArgs);
			}
			else
				if (memory[i + counter + d] == "<" || (memory[i + counter + d].indexOf("<") == 0 && memory[i + counter + d].length > 1))
				{
					var strCounter = 0;
					var strArgs = "";
					if (memory[i + counter + d].indexOf("<") == 0 && memory[i + counter + d].length > 1)
					{
						if (memory[i + counter + d].indexOf(">") == -1)
						{
							strArgs += memory[i + counter + d].substring(1) + " ";
						}
						else
						{
							strArgs += memory[i + counter + d].substring(1, memory[i + counter + d].length - 1);
							args.push(trim(strArgs));
							break;
						}
					}
					d++;
					while (memory[i + counter + d] != ">" && strCounter < maxArrInputSize)
					{
						if (memory[i + counter + d].indexOf(">") != -1)
						{
							strArgs += memory[i + counter + d].substring(0, memory[i + counter + d].length - 1);
							d--;
							break;
						}
						strArgs += memory[i + counter + d] + (memory[i + counter + d + 1] != ">" ? " " : "");

						d++;
						strCounter++;
					}
					d++;
					if (strCounter >= maxArrInputSize)
					{
						WSH.echo("[ERROR] StringSizeOutOfBoundException(" + (counter + d) + ") : StringSize " + strCounter + " > " + maxArrInputSize);
					}
					args.push(trim(strArgs));
				}
				else
					args.push(memory[i + counter + d]);
		}

		return d;
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
			case "write":
				writeString(args); break;
			case "writeLn":
				writeLine(args); break;
			case "writeLn@":
				writeStringLine(args); break;
			case "write$":
				writeStringText(args); break
			case "writeLn$":
				writeStringTextLine(args); break
			case "nextInt":
				setVariable(args[0], Math.floor((Math.random() * 100) + 1)); break
			case "goto":
				gotoLabel(args); break;
			case "shiftVariables":
				varStartIndex = getValue(args[0]); break;
			case "clrscr":
				for (var i = 0; i < 100; i++)
				{
					WSH.echo();
				} break;
			case "writeMemory":
				writeMemory(); break;
			case "flushMemory":
				flushMemory(); break;
			case "loadFile":
				dfmem = readJatFile(args[0]);
				disableShift();
				for (var i = 0; i < varStartIndex - 10; i++)
				{
					memory[i] = dfmem[i];
				}
				counter = 0;
				memlength = memory.length;
				break;
			case "toFile":
				writeToFile(args);
				break;
			case "appendFile":
				appendFile(args);
				break;
			case "deleteFile":
				deleteFile(args);
			case "createFile":
				createFile(args);
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
				break;
			case "isInteger":
				isInteger(args); break;
			case "isInfinite":
				isInfinite(args); break;
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
			case "fact":
				fact(args); break;
			case "removeVariable":
				removeVariable(args); break;
		}
	}

	function hashCode(s)
	{
		var hash = 0, i, chr;
		if (s.length === 0) return hash;
		for (i = 0; i < s.length; i++)
		{
			chr = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	function varIndexFromWord(word)
	{
		var val = +(word.indexOf("$") == 0 || word.indexOf("#") == 0 ? +word.substring(1) : +word);
		if (val == word)
		{
			if (word.indexOf("!") == 0)
				val = +word.substring(1) - varStartIndex;
		}
		if (isNaN(val))
		{
			return hashCode(word.substring(1)) + varStartIndex;
		}
		return +val + (val != word ? varStartIndex : "");
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

	function writeToFile(arr)
	{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if (fso.FileExists(args[0]))
		{
			fso.DeleteFile(args[0]);
		}
		var file = fso.CreateTextFile(args[0], true);
		disableShift();
		var i = 0;
		var line = "";
		while (typeof args[i + 1] != "undefined")
		{
			line += args[i + 1] + " ";
			i++;
		}
		file.writeLine(line);
		file.Close();
		counter += 2 + i;
	}

	function deleteFile(arr)
	{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		fso.DeleteFile(arr[0]);
	}

	function createFile(arr)
	{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		fso.CreateTextFile(arr[0]);
	}

	function appendFile(arr)
	{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var file = fso.OpenTextFile(arr[0], 8, true, -2);

		if (file != null)
		{
			disableShift();
			var i = 0;
			var line = "";
			while (typeof arr[i + 1] != "undefined")
			{
				line += arr[i + 1] + " ";
				i++;
			}
			file.WriteLine(line);
			file.Close();
			counter += 2 + i;
		}
		else
			WSH.echo("[ERROR]Something went wrong");
	}

	function disableShift()
	{
		doShift = false;
	}

	function isInteger(arr)
	{
		var val = getValue(arr[0]);
		setVariable(arr[1], (val ^ 0) === val);
	}

	function removeVariable(arr)
	{
		var varId = varIndexFromWord(arr[0]);
		setVariable(arr[0], undefined);
		flushMemory();
	}
	function flushMemory(arr)
	{
		var dmm = [];
		for (var i = 0; i < memory.length; i++)
		{
			if (memory[i] != undefined && memory[i] != "")
				dmm[i] = memory[i];
		}
		memory = dmm;
	}

	function writeMemory(arr)
	{
		WSH.echo("|_" + memory.join("_|_") + "_|");
	}

	function fact(arr)
	{
		var val = getValue(arr[0]);
		var prod = 1;
		for (var i = val; i > 0; i--)
		{
			prod *= i;
		}
		setVariable(arr[1], prod);
	}
	function isInfinite(arr)
	{
		var val = getValue(arr[0]);
		setVariable(arr[1], val === Number.POSITIVE_INFINITY || val === Number.NEGATIVE_INFINITY);
	}

	function read(arr)
	{
		setVariable(arr[0], WScript.StdIn.ReadLine());
	}
	function write(arr)
	{
		WScript.StdOut.Write(getValue(arr[0]) + " ");
		closedWrite = false;
	}
	function writeString(arr)
	{
		WScript.StdOut.Write(arr[0] + " ");
		closedWrite = false;
	}
	function writeLine(arr)
	{
		WSH.echo(getValue(arr[0]));
	}
	function writeStringLine(arr)
	{
		WSH.echo(arr[0]);
	}
	function writeStringText(arr)
	{
		var ret = "";
		var size = 0;
		for (var i = 0; i < arr.length && arr[i] != ";"; i++)
		{
			var word = arr[i];
			if (word.indexOf("\\") == 0)
				word = word.substring(1);
			ret += word + " ";
			size++;
		}
		counter = counter - 200 + size + 1;
		WScript.StdOut.Write(trim(ret));
		closedWrite = false;
	}
	function writeStringTextLine(arr)
	{
		var ret = "";
		var size = 0;
		for (var i = 0; i < arr.length && arr[i] != ";"; i++)
		{
			var word = arr[i];
			if (word.indexOf("\\") == 0)
				word = word.substring(1);
			ret += word + " ";
			size++;
		}
		counter = counter - 200 + size + 1;
		WSH.echo(trim(ret));
	}
	function gotoLabel(arr)
	{
		var a = ":" + arr[0];
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
		if (typeof getValue(arr[0]) == "number")
		{
			setVariable(arr[0], +getValue(arr[0]) + getValue(arr[1]));
		}
		else
		{
			if (typeof getValue(arr[0]) == "object")//an Array
			{
				try
				{
					var arrBase = getValue(arr[0]);
					var arrFrom = getValue(arr[1]);
					if (typeof arrFrom == "object")
					{
						for (var i = 0; i < arrFrom.length; i++)
						{
							arrBase.push(arrFrom[i]);
						}
					}
					else
					{
						arrBase.push(arrFrom);
					}
				}
				catch (e)
				{
					WSH.echo("[ERROR] You tried to unite array with incompatible object");
				}
			}

			if (typeof getValue(arr[0]) == "string")
			{
				try
				{
					var strBase = getValue(arr[0]);
					var strFrom = getValue(arr[1]);
					if (typeof strFrom == "object")
					{
						var strret = strBase;
						for (var i = 0; i < strFrom.length; i++)
						{
							strret += arrFrom[i];
						}
						setVariable(arr[0], strret);
					}
					else
					{
						setVariable(arr[0], strBase + strFrom);
					}
				}
				catch (e)
				{
					WSH.echo("[ERROR] You tried to unite array with incompatible object");
				}
			}
		}
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
		setVariable(arr[2], (getValue(arr[0]) % getValue(arr[1]) == 0));
	}
	function mod(arr)
	{
		setVariable(arr[2], (getValue(arr[0]) % getValue(arr[1])));
	}
	function set(arr)// a=b
	{
		WSH.echo("|" + getValue(arr[1]) + "|");
		setVariable(arr[0], (getValue(arr[1])));
	}

	function ifWrap(arr)
	{
		var elseif = +arr[0];
		var b = parseBoolean(arr[1]);
		disableShift();
		if (!b)
		{
			counter = elseif;
		}
		else
		{
			counter += 3;
		}
		//WSH.echo("onIf: " + memory[counter]);
	}

	function elseWrap(arr)
	{
		var eif = getValue(arr[0]);
		disableShift();
		counter = eif;
		//WSH.echo("onElse: " + memory[counter]);
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
		for (var i = 0; i < dMem.length; i++)
		{
			memory.push(dMem[i]);
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
			var v = memory[varIndexFromWord(a)];
			if (typeof v == "number")
				return +v;
			return v;
		}
		if (typeof a == "number")
			return +a;
		return a;
	}

	function trim(s)
	{
		var ret = "";
		for (var i = 0; i < s.length; i++)
		{
			if (s.charAt(i) != "\t" && (s.charAt(i) != " " || s.charAt(i - 1) != " ") && s.charAt(i) != "	")
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

		var ifInsideId = 0;
		while (!ts.AtEndOfStream)
		{
			var commenting = false;
			var line = ts.readLine();
			var words = line.split(" ");
			for (var i = 0; i < words.length; i++)
			{
				word = trim(words[i]);
				if (word != "")
				{
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
							ifInsideId += 1;
							dmemory.push("exitPos_" + ifInsideId);
							//WSH.echo("ifexitPos_" + ifInsideId);
							continue;
						}
						if (word == "else")
						{
							dmemory.push("exitPos_" + ifInsideId);
							var pos = dmemory.length;
							//WSH.echo("elsexitPos_" + ifInsideId);

							for (var j = pos - 2; j >= 0; j--)
							{
								if (dmemory[j] == "exitPos_" + ifInsideId)
								{
									dmemory[j] = pos;
								}
							}
							continue;
						}
						if (word == "end")
						{
							var pos = dmemory.length;

							//WSH.echo("endexitPos_" + ifInsideId);
							for (var j = pos; j >= 0; j--)
							{
								if (dmemory[j] == "exitPos_" + ifInsideId)
								{
									dmemory[j] = pos;
								}
							}
							ifInsideId -= 1;
							continue;
						}
					}
					if (word == "#")
					{
						commenting = false;
					}
				}
			}
		}
		ts.Close();
		return dmemory;
	}
}