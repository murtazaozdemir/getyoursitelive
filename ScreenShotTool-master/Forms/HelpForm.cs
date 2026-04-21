using System.Diagnostics;

namespace ScreenShotTool
{
#pragma warning disable CA1416 // Validate platform compatibility
    public partial class HelpForm : Form
    {
        string rtfText = string.Empty;
        string FileName = "readme.MD";
        //string testFile = "test.md";

        public HelpForm()
        {
            InitializeComponent();
            Font = new Font(this.Font.FontFamily, 9);
            OpenFile(FileName);
        }

        void ScrollToLine(int line) // int wantedLine_zero_based = wanted line number; 1st line = 0
        {
            // https://copyprogramming.com/howto/how-can-i-scroll-to-a-specified-line-number-of-a-richtextbox-control-using-c
            int index = richTextBox1.GetFirstCharIndexFromLine(line);
            Debug.WriteLine($"Scrolling help to index {index} (total length is {richTextBox1.TextLength}");
            if (index > -1)
            {
                richTextBox1.Select(index, 0);
                richTextBox1.ScrollToCaret();
            }
        }

        public void ScrollToText(string text)
        {
            int lineNumber = -1;
            for (int i = 0; i < richTextBox1.Lines.Count(); i++)
            {
                if (richTextBox1.Lines[i] == text)
                {
                    lineNumber = i;
                    break;
                }
            }
            //int line = richTextBox1.Text.IndexOf(text);
            if (lineNumber > -1)
            {
                Debug.WriteLine($"Scrolling help to line {lineNumber}: {text}");
                ScrollToLine(lineNumber);
            }
        }

        private void Save_Click(object sender, EventArgs e)
        {
            string saveFile = "readme.rtf";
            SaveFileDialog saveFileDialog = new()
            {
                Filter = "Rich Text|*.rtf",
                FileName = saveFile,
                OverwritePrompt = true
            };
            DialogResult result = saveFileDialog.ShowDialog();
            if (result == DialogResult.OK)
            {
                saveFile = saveFileDialog.FileName;
                File.WriteAllText(saveFile, rtfText); // DON'T specify UTF-8 encoding. It will add the byte markers at the front, making the file incompatible with Word/Wordpad
            }
        }

        public void OpenFile(string fileName)
        {
            if (File.Exists(fileName))
            {
                List<string> lines = File.ReadAllLines(fileName, System.Text.Encoding.UTF8).ToList();
                MarkdownToRtf.RtfConverter rtfConverter = new(fileName);
                rtfText = rtfConverter.ConvertText(lines);
            }

            if (rtfText.Length == 0)
            {
                rtfText = helpTextFallback;
            }

            bool oldReadonly = richTextBox1.ReadOnly;
            richTextBox1.ReadOnly = false;
            richTextBox1.Rtf = rtfText;
            richTextBox1.ReadOnly = oldReadonly;
        }

        private void CopyToClipboard_Click(object sender, EventArgs e)
        {
            Clipboard.SetText(rtfText, TextDataFormat.Rtf);
        }

        private void LinkLabelDocumentation_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MainForm.OpenLink("https://github.com/snjo/ScreenShotTool/");
        }

        private void RichTextBox1_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F5)
            {
                OpenFile(FileName);
            }
            if (e.KeyCode == Keys.O && e.Modifiers == Keys.Control)
            {
                OpenFileDialog openFileDialog = new()
                {
                    Filter = "Markdown|*.md",
                    ShowPinnedPlaces = true,
                    ShowPreview = true
                };
                DialogResult = openFileDialog.ShowDialog();
                if (DialogResult == DialogResult.OK)
                {
                    FileName = openFileDialog.FileName;
                    OpenFile(FileName);
                }
            }
        }

        readonly string helpTextFallback =
            "{\\rtf1\\ansi{\\fonttbl\\f0\\fswiss Helvetica;}\\pard" +
            "\\i   Could not load readme.md. This is a hardcoded copy of the help manual, and could be out of date." +
            "\\par   Open \\b Help > Documentation (on github)\\b0  for more info.\\i0 \\fs18 \\par " +
            "\\par\\b1 \\fs32 Capture Modes\\b0 \\fs18 \\par " +
            "\\par Screenshots are performed using hotkeys defined in Options.\\par " +
            "\\par \\b1 Default hotkeys:\\b0 \\par " +
            "\\par Region\t\tPrintscreen" +
            "\\par Window\t\tAlt + PrintScreen" +
            "\\par Screen\t\tCtrl + PrintScreen" +
            "\\par All screens\tNo preset" +
            "\\par Open last folder\tNo preset" +
            "\\par " +
            "\\par \\b1 \\fs28 Region capture\\b0 \\fs18" +
            "\\par " +
            "\\par During region capture, the current screen the mouse cursor is on will display a region selection interface.\\par" +
            "\\par Click and drag the mouse to create a selection. This can be refined with the keys shown below." +
            "\\par \\par To confirm the region, press Enter to save to file, C to copy the selection to the clipboard or E to open the selection in the Editor. Press Escape to exit." +
            "\\par \\par If you select the option \"Complete capture when releasing mouse\", the output is instead decided by the otions for saving to file, clipboard or open in Editor (Options > Modes: Region)" +
            "\\par \\par When adjusting the size of the region, arrows will indicate what edges are affected by arrow key presses.\\par When adjusting the position of the region, arrows are shown in all directions." +
            "\\par \\par " +
            "\\par \tEnter\t\tSave image to file and exit Region capture" +
            "\\par \tC\t\tCopy image to clipboard and exit Region capture" +
            "\\par \tE\t\tOpen the selection in the Editor and exit Region captrue" +
            "\\par \tEsc\t\tExit region capture, discard selection" +
            "\\par \tS\t\tSize adjustment mode (Default)" +
            "\\par \tP\t\tPosition adjustment mode" +
            "\\par \tCtrl+Arrow Key\tSize adjustemt side selection" +
            "\\par \tArrow Key\tSize / Position adjustement" +
            "\\par \tShift\t\tHold Shift to adjust region by 10 pixels instead of 1" +
            "\\par \\par \\fs24 Region framerate\\fs18 " +
            "\\par \\par The specified framerate in Options sets the max amount of times per second the region UI will update." +
            "\\par If this is too high, the system can't catch up, and lag may be worse than if you set a lower framerate.\\par A good system should be able to handle 60fps. Default is 30fps." +
            "\\par (Options > Mode: Region)" +
            "\\par \\par --------------------------------------------------------------------------------------" +
            "\\par \\par \\b1 \\fs28 Window capture\\fs18 \\b0 " +
            "\\par \\par Captures the active window." +
            "\\par Save to file, open in Editor or copy to clipboard based on options (Options > Modes: Window)" +
            "\\par \\par --------------------------------------------------------------------------------------" +
            "\\par \\par \\b1 \\fs28 Screen capture\\fs18 \\b0 " +
            "\\par \\par Captures the screen the mouse cursor is currently in." +
            "\\par Save to file, open in Editor or copy to clipboard based on options (Options > Modes: Window)" +
            "\\par \\par --------------------------------------------------------------------------------------" +
            "\\par \\par \\b1 \\fs28 All Screens capture\\fs18 \\b0 " +
            "\\par \\par Captures all screen in a single image." +
            "\\par Save to file, open in Editor or copy to clipboard based on options (Options > Modes: Window)" +
            "\\par \\par --------------------------------------------------------------------------------------" +
            "\\par \\par \\b1 \\fs32 Capture output\\fs18 \\b0 " +
            "\\par \\par \\b1 \\fs24 File name variables\\fs18 \\b0 " +
            "\\par \\par When saving to file, the name of the active application, time or incrementing numbers can be included in the file or folder name." +
            "\\par The default file name is \"$w $d $t $c\", which will output something like \"MyWindow 2023-12-31 16:02 003\"" +

            "\\par \\par" +
            "\t$w\tActive Window title (\"Region\" or \"Screen\" is used in those modes)\\par " +
            "\t$d\tDate in ISO format (2023-12-31)\\par " +
            "\t$t\tTime\\par " +
            "\t$ms\tMilliseconds\\par " +
            "\t$c\tCounter number (auto increments)\\par " +
            "\\par \\par " +

            "You can also use longer form variables, these are identical to Greenshot's variable format. \\par \\par " +
            "\t$\\{DATE\\}\t\tDate in ISO format (2023-12-31) \\par " +
            "\t$\\{YYYY\\}\t\tYear \\par " +
            "\t$\\{MM\\}\t\tMonth number \\par " +
            "\t$\\{DD\\}\t\tDay number \\par " +
            "\t$\\{hh\\}\t\tHour \\par " +
            "\t$\\{mm\\}\t\tMinute \\par " +
            "\t$\\{ss\\}\t\tSecond \\par " +
            "\t$\\{ms\\}\t\tMillisecond \\par " +
            "\t$\\{NUM\\}\t\tCounter number (auto increments) \\par " +
            "\t$\\{title\\}\t\tActive Window title (\"Region\" or \"Screen\" is used in those modes) \\par " +
            "\t$\\{user\\}\t\tUser account name \\par " +
            "\t$\\{domain\\}\tUser's domain \\par " +
            "\t$\\{hostname\\}\tPC name \\par " +

            "\\par \\par \\b1 \\fs24 Title tweaks\\fs18 \\b0 " +
            "\\par \\par The title of the active window when using $w can be adjusted to make file names nicer." +
            "\\par \\par \\b1 \\fs24 Window title max length\\fs18 \\b0 " +
            "\\par \\par Limits the name length to prevent long file names." +
            "\\par \\par \\b1 \\fs24 Split Window title using string\\fs18 \\b0 " +
            "\\par \\par If a window title is dynamically altered by the file it's viewing, extract just the part you're interested in." +
            "\\par \\par Which of the split name element to use is set by the option \"Keep split text in index\", where 0 is the first element." +
            "\\par \\par \tExample: \"ImageEditor - mypicture.png - v12.2\"" +
            "\\par \\par \tSplit with \" - \"" +
            "\\par \\par \tKeep split text in index: 0" +
            "\\par \tResult: $w outputs \"ImageEditor\"" +
            "\\par \\par \tKeep split text in index: 1" +
            "\\par \tResult: $w outputs \"mypicture.png\"" +
            "\\par \\par \\b1 \\fs24 Crop Window capture\\fs18 \\b0 " +
            "\\par \\par If on, this option crops the captured window from top, left, right and bottom." +
            "\\par This can be used to remove the window title bar and edges. In the Windows 11 default theme, values of 32,10,10,10 will remove these." +
            "\\par \\par --------------------------------------------------------------------------------------" +
            "\\par \\par \\b1 \\fs32 Application options\\fs18 \\b0 " +
            "\\par \\par \\b1 \\fs24 Start Hidden\\fs18 \\b0 " +
            "\\par \\par Start the application without appearing on screen or on the task bar. Interact with it via the System Tray icon or hotkeys." +
            "\\par You can add the application to start automatically by placing a shortcut in the Startup folder: *%appdata%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup*" +
            "\\par \\par \\b1 \\fs24 System tray tooltips\\fs18 \\b0 " +
            "\\par \\par System tray tooltip options will display a notification in the lowe right of the screen when capturing, creating folders, or there's a problem." +
            "\\par \\par \\b1 \\fs24 Thumbnails\\fs18 \\b0 " +
            "\\par \\par Specify the size of the thumbnails used in the application. This does not affect the saved files." +
            "\\par \"Crop thumbnails\" will make the thumbnails retain their aspect ration, but parts of the image are cut in the capture list thumbnail." +
            "\\par " +
            "\\par " +
            "}";


    }
}
