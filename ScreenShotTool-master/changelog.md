## Changelog

## 2.7 (In Progress)

## 2.6
- Added category filter to the Tag list. New tags automatically get assigned the current filter as category name.
- Added higlight blend modes "Tint", "Tint Bright Colors" and "Dither"
- Some blend modes transparency can now be set by the selected fill color's alpha
- Added text rendering anti alias options.
- Fixed color picker showing solid colors with transparency
- Fixed "out of memory" error when selecting a region that extended off screen

## 2.5
- Trim the number of thumbnails in the list periodically, based on max thumbs setting
- Disable thumbnail list if max thumbs is 0
- Fixed error where some dark pixels were saved as transparent (now using Format32bppRgb during capture)

## 2.4
- Menu items: Save an image from the clipboard directly to a file, or add it to file drop for pasting to file explorer
- Menu item: Fix clipboard images, convert them to a more compatible format (e.g. when copying from MS Teams and pasting to old programs)
- Hotkeys available for the above clipboard to file / clipboard to file drop
- File context menu: Added "Rename / Move file"
- New highlighter blend mode: Invert Brightness, maintains hue
- Blend mode Desaturate now uses perceptual brightness, not flat RGB values
- Thumbnails are added to the start of the list by default (reverse chronological). Adjustable in options
- Thumbnail list scrolls to the most recent capture
- Changelog available from Help menu (github link)
- Tags have a category, in preparation for future features
- Fix missing leading zeroes on month and day in file names
- Fix file drop list not working reliably (from capture list and clipboard to drop list)
- File drop uses the %temp% folder
- Fix errors with invalid drive letters and characters in file names
- Fix some dark pixels turning transparent in screenshots

## 2.3
- Removed hang when clearing large lists of thumbnails (removed un-needed image dispose)

## 2.2
- Added option to send deleted files to recycle bin
- Blend modes can affect different color channels differently (per-channel blend mode)
- New tags are added below the currently selected tag
- Fixed locked files after aborted image convert

## 2.1
- Added Contrast to the highlighter blend modes
- Tag view option to disable multi select of active tags
- Fixed missing 0-padding on timestamps in file names

## 2.0
- Customize file/folder output name on the fly with the Tag editor window. Use with the $TAG variable in output settings.
- Numbered markers can have custom text instead of auto numbering
- Fixed bug when copying and saving images with highlighter blend modes applying twice
- Rebuilt Symbol property panels

## 1.9
- Save certain settings to registry as a fallback if they fail after upgrading the program (folder, file and hotkey settings)
- Added help and about to Editor
- Help jumps to the right section for the Window it's opened from
- Bug fixes and UI tweaks

## 1.8

#### Editor
- PDF support. Save captures directly to PDF
- Print from the editor
- Convert captured images to other image formats or PDF from the capture list or editor.
- New Stickers button, easily insert emojis, cursors etc. from a preset folder. (this folder can be changed in Options)
- Drag and drop images into editor
- Image symbols can be rotated
- Changed shadow rendering, supports images with alpha
- Proportional scaling of symbols with Shift
- Multi select symbols in list or with Control-click (allows deleting and moving multiple symbols)
- Move symbols with arrow keys, Shift to move x10
- Move symbols to Back/Front with Home/End
- Support for screens with zoom other than 100%. Some UI changes done to allow for this.
- Multiline text, and double click to edit text symbols
- Paste text directly into editor
- Open Editor directly with -editor command line argument, or using a file's Open With or drag and drop on exe. (Does not start the rest of the program)


## 1.7

#### Editor
- Freehand draw lines and closed curves
- Crop or copy region
- Color picker, pick from anywhere on any screen
- Blur and highlighter draw symbols beneath them properly
- Color dialog with alpha
- Move symbols to back or front
- Options: Place one or more symbols in a row, and cancelling placement (right click/Esc)
- Option: Autorun on Windows startup
- Copy and paste images with transparency (internal to the program, clipboard paste from elsewhere does not support alpha)
- Paste image from file, supports transparency
- Pasting images no longer uses click-drag, placed immediately at cursor position

## 1.5

v1.5

#### Editor
- Crop
- Highlighter
- Blend modes
- Performance improvements

## 1.4

- New image Editor for marking up screenshots.
- Markdown viewer for displaying the readme in Help.

## 1.1

- Help and About added
- button and menu changes

## 1.0

- Region capture with graphic overlay
- Lots of changes from the original Window capture only application