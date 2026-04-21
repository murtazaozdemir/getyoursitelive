set inkskape="c:\Program Files\Inkscape\bin\inkscapecom.com"
@echo START
::for /f %%f in ('dir /b *.svg') do echo %%f
for /f %%f in ('dir /b *.svg') do %inkskape% "%%f" --export-dpi=150 --export-type=png --export-filename="png\%%f.png"
@echo END
pause