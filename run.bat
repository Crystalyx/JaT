@Echo off
set /p a=Enter Filename: 
call CScript JaT_Interpretator.js %a%
@Pause
@Echo on