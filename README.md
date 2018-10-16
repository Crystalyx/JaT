# JaT
This is my language for Scripts subject
Language bases on three things:
<p>
•almost all information stored in "memory<br/>
•functions and arguments should be written one after another separated by spaces<br/>
•when you call variable, you use it's ordinal number in memory (after last commits you can use words, but it takes mush more memory than numeric identifiers.<br/>
<br/>
interpretator has two modes of work:<br/>
•file interpretation - you give file name as an argument #1 and interpretator runs it.<br/>
•console mode - you give "console" as an argument #1 and you get "console". e.g. you should write functions and arguments for functions and it will be processed in real-time.<br/>
<br/>
language has nearly 39 functions (number in brackets is an argument count):<br/>
<br/>
•read[1] - reads value provided from the keyboard and saves it into argument as variable;<br/>
•write[1] - tries to get variable value, otherwise just write provided text to the console without "\n";<br/>
•writeLn[1] - tries to get variable value, otherwise just write provided text to the console with "\n";<br/>
•write@[1] - just write provided text to the console without "\n";<br/>
•writeLn@[1] - - just write provided text to the console without \n;<br/>
•goto[1] - sets counter position to a providided value;<br/>
•+[2]; - tries to add #1 and #2 and saves to #1<br/>
•-[2]; - tries to sub #1 and #2 and saves to #1<br/>
•*[2]; - tries to multiply #1 and #2 and saves to #1<br/>
•//[2] - saves integer part of ratio between #1 and #2 to #3;<br/>
•%[2] - saves fractional part of ratio between #1 and #2 to #3;<br/>
•|[2] - sets the #3 true if #2 divides #1 and false otherwise;<br/>
•=[2] - sets the current #1 variable value to #2;<br/>
•if [1] ... [else] end - "if" construction;<br/>
•and[3] - set #3 equal to (#1 and #2);<br/>
•or[3] - set #3 equal to (#1 or #2);<br/>
•==[3] - sets the #3 true if #1 = #1;<br/>
•not[2] - sets #2 not value of #1;<br/>
•>[3] - sets #3 true if #1 > #2;<br/>
•>=[3] - sets #3 true if #1 >= #2;<br/>
•<[3] - sets #3 true if #1 < #2;<br/>
•<=[3] - sets #3 true if #1 <= #2;<br/>
•isInteger[2] - sets #2 true if #1 is Integer value;<br/>
•isInfinite[2] - sets #2 true if #1 == +Infinity or #1 == -Infinity;<br/>
•nextInt[1] - sets #1 value to random integer between zero and 100;<br/>
•fact[2] - sets #2 value to #1 factorial;<br/>
•writeMemory[0] - prints all the memory to a console;<br/>
•flushMemory[0] - tries to free up memory;<br/>
•removeVariable[1] - removes variable with name <#1> value and  free up memory ;<br/>
•loadFile[1] - loads file with name <#1> and runs it in console. After that returns to a console mode;<br/>
•toFile[2] - sets current file content to #2;<br/>
•appendFile[2] - appends current file content to #2;<br/>
•deleteFile[1] - tries to delete file #1. Actually just removes all the text inside;<br/>
•createFile[1] - tries to create file #1;<br/>
•writeCounter[0] - prints current counter value. Used for debug;<br/>
•shiftVariables[1] - shifts varStartIndex to #1. Used to control memory in console;<br/>
•clrscr[0] - tries to clear all console. Actually prints many "\n" simbols ~ 20;<br/>
•:<labelName> - creates a label <labelName>;<br/>
•$<variableName> - returns value of variable <variableName>;<br/>
•$<variableName>:<arrayIndex> - returns value of <arrayIndex> element of  <variableName> array;<br/>
•<...> - defines string. Still doesn't normally work with spaces;<br/>
•[...] - defines an array;<br/>
•##...[#] - used to create comments. "##" comments whole line. "#" after "##" stops commenting and continues running program;<br/>
<p/>

