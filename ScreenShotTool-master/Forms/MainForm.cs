using Hotkeys;
using Microsoft.VisualBasic.FileIO;
using ScreenShotTool.Classes;
using ScreenShotTool.Forms;
using ScreenShotTool.Properties;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;
using System.Text;

[assembly: AssemblyVersion("2.6.*")]

#pragma warning disable IDE0090 // Use 'new(...)'

namespace ScreenShotTool;

[SupportedOSPlatform("windows")]
public partial class MainForm : Form
{
    #region Declare variables
    public static readonly string ApplicationName = "Screenshot Tool";
    readonly Settings settings = Settings.Default;
    HelpForm? helpWindow;
    ImageFormat DestinationFormat = ImageFormat.Jpeg;
    string lastFolder = ".";
    string lastSavedFile = "";
    Options? options;
    bool showLog = false;
    private int Counter = 0;
    private readonly int CounterMax = 9999;
    private bool ExitForSure = false;
    private static string FileDropTempFolder
    {
        get
        {
            return Environment.ExpandEnvironmentVariables("%temp%\\ScreenshotTool\\filedrop");
        }
    }

    public string helpText =
        "Default filename values:\r" +
        "\n$w $c\r\n\r" +
        "\n$w: Active Window Title\r" +
        "\n$d/t/ms: Date, Time, Milliseconds\r" +
        "\n$c: Counter number (auto increments)";

    public bool ShowThumbnails
    {
        get { return settings.MaxThumbnailsInList > 0; }
    }
    Bitmap? bitmap;
    readonly ImageList imageList = new ImageList();
    readonly Tagging tagging;
    DateTime lastCaptureTime = DateTime.MinValue;
    #endregion

    #region DLLimports

    [LibraryImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static partial bool SetForegroundWindow(IntPtr hWnd);

    // https://stackoverflow.com/questions/5878963/getting-active-window-coordinates-and-height-width-in-c-sharp

    [DllImport("user32.dll")]
#pragma warning disable SYSLIB1054 // Use 'LibraryImportAttribute' instead of 'DllImportAttribute' to generate P/Invoke marshalling code at compile time
    static extern IntPtr GetForegroundWindow();


    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    private static IntPtr GetActiveWindow()
    {
        //Debug.WriteLine("ForeGround Window:" + GetForegroundWindow());
        return GetForegroundWindow();
    }

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

#pragma warning restore SYSLIB1054 // Use 'LibraryImportAttribute' instead of 'DllImportAttribute' to generate P/Invoke marshalling code at compile time


    #endregion

    #region form open and close
    public MainForm()
    {
        InitializeComponent();
        tagging = new Tagging();
        Font = new Font(this.Font.FontFamily, 9);
        UpgradeSettings();
        tagging.LoadTagData();
        LoadHotkeysFromSettings();

        UpdateTrimStatus();

        if (Settings.Default.StartHidden)
        {
            HideApplication();
        }
        else
        {
            ShowApplication();
        }

        UpdateLogVisible();

        SetInfoText();
        listViewThumbnails.ListViewItemSorter = new CompareByIndex(this.listViewThumbnails);
    }

    private void ExitProgram()
    {
        ExitForSure = true;
        Close();
    }



    private void MainForm_Load(object sender, EventArgs e)
    {
        if (settings.ThumbnailWidth > 256) settings.ThumbnailWidth = 256;
        if (settings.ThumbnailHeight > 256) settings.ThumbnailHeight = 256;
        imageList.ImageSize = new Size(settings.ThumbnailWidth, settings.ThumbnailHeight);
        imageList.ColorDepth = ColorDepth.Depth32Bit;
        listViewThumbnails.LargeImageList = imageList;
        SetCounter(settings.Counter);
    }

    private void HideApplication()
    {
        //Don't use this.ShowInTaskbar = true/false, it breaks hotkeys
        Debug.WriteLine("Hiding application");
        this.WindowState = FormWindowState.Minimized;
        Hide();
    }

    private void ShowApplication()
    {
        Debug.WriteLine("Showing Application");
        Show();
        WindowState = FormWindowState.Normal; // setting Normal here makes it actually show up in front of other windows
    }

    private void Form1_FormClosing(object sender, FormClosingEventArgs e)
    {
        Debug.WriteLine($"FormClosing: {e.CloseReason} {sender}");
        tagging.SaveTagData();
        if (settings.MinimizeOnClose && ExitForSure == false)
        {
            this.WindowState = FormWindowState.Minimized;
            e.Cancel = true;
        }
        else
        {
            HotkeyTools.ReleaseHotkeys(HotkeyList);
        }
        DeletFileDropFiles();
    }

    private void MainForm_SizeChanged(object sender, EventArgs e)
    {
        if (WindowState == FormWindowState.Minimized)
        {
            if (Settings.Default.StartHidden)
            {
                HideApplication();
            }
        }
        UpdateLogVisible();
    }
    #endregion

    #region Settings

    private void UpgradeSettings()
    {
        if (Settings.Default.UpgradeSettings)
        {
            Debug.WriteLine("Upgrading settings from previous version");
            WriteMessage("Upgrading settings");
            Settings.Default.Upgrade();
            if (Settings.Default.UpgradeSettings == true)
            {
                if (SettingsRegistry.LoadSettingsFromRegistry())
                {
                    WriteMessage("Loading fallback settings from registry");
                }
                else
                {
                    WriteMessage("No fallback settings in registry, using default settings");
                }
            }
            Settings.Default.UpgradeSettings = false;
            if (Autorun.Autorun.UpdatePathIfEnabled(ApplicationName))
            {
                WriteMessage("Autorun is enabled, updating path in registry");
            }
        }
        else
        {
            Debug.WriteLine("Not upgrading settings");
            WriteMessage("Loading settings from user config");
        }
        // test of registry loading
        //SettingsRegistry.LoadSettingsFromRegistry();
        // end test
    }

    public void LoadHotkeysFromSettings()
    {
        HotkeyList = HotkeyTools.LoadHotkeys(HotkeyList, HotkeyNames, this);

        if (settings.RegisterHotkeys)
        {
            string[] warningKeys = HotkeyTools.RegisterHotkeys(HotkeyList);

            if (warningKeys.Length > 0)
            {
                string warningText = "";
                if (warningKeys.Length > 0)
                {
                    foreach (string key in warningKeys)
                    {
                        warningText += Environment.NewLine + key;
                    }
                }
                ShowBalloonToolTip("Could not register hotkeys", warningText, ToolTipIcon.Warning, BalloonTipType.HotkeyError);
            }
        }
    }

    public void UpdateTrimStatus()
    {
        string disableCrop = "Disable &Cropping";
        string enableCrop = "Enable &Cropping";
        if (settings.TrimChecked)
        {
            enableCroppingToolStripMenuItem.Text = disableCrop;
            toggleCropToolStripMenuItem.Text = disableCrop;


        }
        else
        {
            enableCroppingToolStripMenuItem.Text = enableCrop;
            toggleCropToolStripMenuItem.Text = enableCrop;
        }
        if (options != null)
        {
            if (!options.IsDisposed)
            {
                options.UpdateTrimCheck();
            }
        }
    }
    #endregion

    #region Hotkeys

    // Add hotkey:
    // Add entry to MainForm.cs method HotkeyNames
    // Add entry to MainForm.cs method HandleHotkey
    // Add hotkey values to Settings.settings file
    // Settings values per new key: hk???Key hk???Ctrl hk???Alt hk???Shift hk???Win

    public Dictionary<string, Hotkey> HotkeyList = [];

    public static readonly List<string> HotkeyNames =
    [
        "CaptureRegion",
        "CaptureWindow",
        "CaptureCurrentScreen",
        "CaptureAllScreens",
        "BrowseFolder",
        "SaveClipboardToFile",
        "CopyClipboardToFileDrop"
    ];

    protected override void WndProc(ref Message m)
    {
        base.WndProc(ref m);
        if (m.Msg == Hotkeys.Constants.WM_HOTKEY_MSG_ID)
        {
#pragma warning disable IDE0059 // Unnecessary assignment of a value
            Keys key = (Keys)(((int)m.LParam >> 16) & 0xFFFF);                  // The key of the hotkey that was pressed.
            KeyModifier modifier = (KeyModifier)((int)m.LParam & 0xFFFF);       // The modifier of the hotkey that was pressed.
            int id = m.WParam.ToInt32();                                        // The id of the hotkey that was pressed.
            HandleHotkey(id);
#pragma warning restore IDE0059 // Unnecessary assignment of a value
        }
    }

    private void HandleHotkey(int id)
    {
        if (id == HotkeyList["CaptureWindow"].ghk.id)
        {
            CaptureAction(CaptureMode.Window);
        }
        if (id == HotkeyList["CaptureRegion"].ghk.id)
        {
            CaptureAction(CaptureMode.Region);
        }
        if (id == HotkeyList["CaptureCurrentScreen"].ghk.id)
        {
            CaptureAction(CaptureMode.SingleScreen);
        }
        if (id == HotkeyList["CaptureAllScreens"].ghk.id)
        {
            CaptureAction(CaptureMode.AllScreens);
        }
        else if (id == HotkeyList["BrowseFolder"].ghk.id)
        {
            BrowseFolderInExplorer(lastFolder);
        }
        else if (id == HotkeyList["SaveClipboardToFile"].ghk.id)
        {
            ClipboardImageToSaveFile();
        }
        else if (id == HotkeyList["CopyClipboardToFileDrop"].ghk.id)
        {
            ClipboardImageToFileDrop();
        }
    }

    #endregion

    #region Capture

    public enum CaptureMode
    {
        SingleScreen,
        AllScreens,
        Window,
        Region,
    }

    public void CaptureAction(CaptureMode mode)
    {
        lastCaptureTime = DateTime.Now;
        string DestinationFolder = ComposeFileName(settings.Foldername);
        string DestinationFileName = ComposeFileName(settings.Filename);
        string DestinationFileExtension = settings.FileExtension;
        bool savedToFile = false;
        SetImageFormat();

        if (mode == CaptureMode.Window)
        {
            savedToFile = CaptureWindow(DestinationFolder, DestinationFileName + DestinationFileExtension, DestinationFormat);
        }
        else if (mode == CaptureMode.SingleScreen)
        {
            DestinationFolder = ComposeFileName(settings.Foldername, "Screen");
            DestinationFileName = ComposeFileName(settings.Filename, "Screen");
            savedToFile = CaptureSingleScreen(DestinationFolder, DestinationFileName + DestinationFileExtension, DestinationFormat);
        }
        else if (mode == CaptureMode.AllScreens)
        {
            DestinationFolder = ComposeFileName(settings.Foldername, "Screen");
            DestinationFileName = ComposeFileName(settings.Filename, "Screen");
            savedToFile = CaptureAllScreens(DestinationFolder, DestinationFileName + DestinationFileExtension, DestinationFormat);
        }
        else if (mode == CaptureMode.Region)
        {
            DestinationFolder = ComposeFileName(settings.Foldername, "Region");
            DestinationFileName = ComposeFileName(settings.Filename, "Region");
            savedToFile = CaptureRegion(DestinationFolder, DestinationFileName + DestinationFileExtension, DestinationFormat, settings.RegionCaptureUseAllScreens);
        }

        if (settings.Filename.Contains("$c") && savedToFile)
        {
            IncrementCounter();
        }

        if (ShowThumbnails && savedToFile)
        {
            AddThumbnail(Path.Combine(DestinationFolder, DestinationFileName + DestinationFileExtension), bitmap);
            UpdateInfoLabelVisibility();
        }

        bitmap?.Dispose();
    }

    public bool CaptureWindow(string folder, string filename, ImageFormat format)
    {
        bool saved = false;
        GetWindowRect(GetActiveWindow(), out RECT windowRect);
        if (settings.TrimChecked)
        {
            windowRect.Left += settings.TrimLeft;
            windowRect.Right -= settings.TrimRight;
            windowRect.Top += settings.TrimTop;
            windowRect.Bottom -= settings.TrimBottom;
        }
        if (windowRect.Width > 0 && windowRect.Height > 0)
        {
            bitmap?.Dispose();
            bitmap = ImageProcessing.CaptureBitmap(windowRect.Left, windowRect.Top, windowRect.Width, windowRect.Height);
            if (settings.WindowToFile)
            {
                saved = SaveBitmap(folder, filename, format, bitmap);
            }
            if (settings.WindowToClipboard)
            {
                ClipboardHelpers.SetImage(bitmap);
            }
            return saved;
        }
        else
        {
            Debug.WriteLine("Capture size is less than zero. Capture aborted.");
            ShowBalloonToolTip("Capture error", "Capture size is less than zero. Capture aborted.", ToolTipIcon.Warning, BalloonTipType.ScreenshotError);
            return false;
        }
    }

    public bool CaptureRegion(string folder, string filename, ImageFormat format, bool useAllScreens)
    {
        bool saved = false;
        ImageView imgView;

        if (useAllScreens)
        {
            imgView = ImageView.CreateUsingAllScreens(ImageView.ViewerMode.cropCapture);
        }
        else
        {
            imgView = ImageView.CreateUsingCurrentScreen(ImageView.ViewerMode.cropCapture);
        }

        imgView.SetImage();
        DialogResult result = imgView.ShowDialog();
        if (result == DialogResult.Yes) // Yes means save to file
        {
            Bitmap? bmpResult = imgView.GetBitmap();
            if (bmpResult != null)
            {
                //save to file or copy to clipboard is handled inside the viewer
                saved = SaveBitmap(folder, filename, format, bmpResult);

                bitmap?.Dispose();
                bitmap = bmpResult;
            }
            else
            {
                Debug.WriteLine("ImageView result image was null");
                saved = false;
            }
        }
        return saved;
    }

    public bool CaptureSingleScreen(string folder, string filename, ImageFormat format)
    {
        bool saved = false;
        Screen screen = Screen.FromPoint(Cursor.Position);
        bitmap?.Dispose();
        bitmap = GetScreenImage(screen);

        if (settings.ScreenToFile)
        {
            saved = SaveBitmap(folder, filename, format, bitmap);
        }
        if (settings.ScreenToClipboard)
        {
            ClipboardHelpers.SetImage(bitmap);
        }
        return saved;
    }

    public bool CaptureAllScreens(string folder, string filename, ImageFormat format)
    {
        bool saved = false;
        bitmap?.Dispose();
        bitmap = GetAllScreensImage();

        if (settings.ScreenToFile)
        {
            saved = SaveBitmap(folder, filename, format, bitmap);
        }
        if (settings.ScreenToClipboard)
        {
            ClipboardHelpers.SetImage(bitmap);
        }
        return saved;
    }


    private Bitmap GetAllScreensImage()
    {
        Rectangle screenBound = SystemInformation.VirtualScreen;
        if (screenBound.Width > 0 && screenBound.Height > 0)
        {
            return ImageProcessing.CaptureBitmap(screenBound.Left, screenBound.Top, screenBound.Width, screenBound.Height);
        }
        else
        {
            Debug.WriteLine("Screen bounds size is less than zero. Capture aborted.");
            ShowBalloonToolTip("Capture error", "Screen bounds  size is less than zero. Capture aborted.", ToolTipIcon.Warning, BalloonTipType.ScreenshotError);
        }
        return new Bitmap(0, 0);
    }

    private Bitmap GetScreenImage(Screen screen)
    {
        Rectangle screenBound = screen.Bounds;//SystemInformation.VirtualScreen;
        if (screenBound.Width > 0 && screenBound.Height > 0)
        {
            return ImageProcessing.CaptureBitmap(screenBound.Left, screenBound.Top, screenBound.Width, screenBound.Height);
        }
        else
        {
            Debug.WriteLine("Screen bounds size is less than zero. Capture aborted.");
            ShowBalloonToolTip("Capture error", "Screen bounds  size is less than zero. Capture aborted.", ToolTipIcon.Warning, BalloonTipType.ScreenshotError);
        }

        return new Bitmap(0, 0);
    }
    #endregion

    #region Make Filename

    private static string MakeValidFileName(string name)
    {
        // from https://stackoverflow.com/questions/309485/c-sharp-sanitize-file-name
        string invalidChars = System.Text.RegularExpressions.Regex.Escape(new string(System.IO.Path.GetInvalidFileNameChars()));
        string invalidRegStr = string.Format(@"([{0}]*\.+$)|([{0}]+)", invalidChars);

        return System.Text.RegularExpressions.Regex.Replace(name, invalidRegStr, "_");
    }

    private static string MakeValidDirectoryName(string name)
    {
        name = name.Trim();
        List<char> invalidPathChars = Path.GetInvalidPathChars().ToList();
        bool fixesNeeded = false;

        // add / : * ? " < > |
        invalidPathChars.AddRange(new List<char> { '/', ':', '*', '?', '"', '<', '>' }); // from the ones in the invalid file chars list, except backslash

        bool hasDriveLetter = false;

        if (name.Length > 1) // allow for : one place, after the drive letter, if so split the first two chars from the rest for processing
        {
            char driveLetter = name[0];
            bool driveLetterIsValid = false;
            if ((driveLetter >= 'A' && driveLetter <= 'Z') || (driveLetter >= 'a' && driveLetter <= 'z'))
                driveLetterIsValid = true;
            if (name[1] == ':' && driveLetterIsValid)
                hasDriveLetter = true;
        }

        string postDriveLetter = name.Substring(2);

        string processName = hasDriveLetter ? postDriveLetter : name;

        foreach (char invalidPathChar in invalidPathChars)
        {
            if (processName.Contains(invalidPathChar))
            {
                processName = processName.Replace(invalidPathChar, '_');
                Debug.WriteLine($"Replaced {invalidPathChar} with _");
                fixesNeeded = true;
            }
        }

        StringBuilder sb = new();

        if (hasDriveLetter)
        {
            sb.Append(name.Substring(0, 2));
        }
        sb.Append(processName);

        if (fixesNeeded)
        {
            Debug.WriteLine($"Save path fixed from: '{name}' to: '{sb}'");
        }
        return sb.ToString();
    }

    private static string ShortenString(string input, int maxLength)
    {
        return input[..Math.Min(maxLength, input.Length)].Trim();
    }

    public void SetCounter(int num, bool saveSetting = true)
    {
        if (num > CounterMax)
        {
            num = 1;
        }
        Counter = num;

        if (saveSetting)
        {
            settings.Counter = Counter;
            settings.Save();
        }
    }

    public int GetCounter()
    {
        return Counter;
    }

    private void IncrementCounter()
    {
        SetCounter(Counter + 1);
    }

    public string ComposeFileName(string text, string overrideTitle = "")
    {
        string splitTitleString = settings.SplitTitleString;
        int titleMaxLength = settings.TitleMaxLength;
        int splitTitleIndex = settings.SplitTitleIndex;
        string alternateTitle = settings.AlternateTitle;
        string year = DateTime.Now.Year.ToString();
        string month = DateTime.Now.Month.ToString().PadLeft(2, '0');
        string day = DateTime.Now.Day.ToString().PadLeft(2, '0');
        string fullDateISO = $"{year}-{month}-{day}";

        string hour = DateTime.Now.Hour.ToString().PadLeft(2, '0');
        string minute = DateTime.Now.Minute.ToString().PadLeft(2, '0');
        string second = DateTime.Now.Second.ToString().PadLeft(2, '0');
        string millisecond = DateTime.Now.Millisecond.ToString().PadLeft(3, '0');
        string time = $"{hour}-{minute}-{second}";

        string counter = Counter.ToString().PadLeft(3, '0');

        string user = System.Environment.UserName;
        string domain = System.Environment.UserDomainName;
        string hostname = System.Environment.MachineName;

        string windowTitle;
        if (overrideTitle.Length > 0)
        {
            windowTitle = overrideTitle;
        }
        else
        {
            windowTitle = MakeValidFileName(GetActiveWindowTitle());
            windowTitle = ShortenString(windowTitle, titleMaxLength);
        }
        if (splitTitleString.Length > 0)
        {
            string[] titleSplit = windowTitle.Split(splitTitleString);
            int splitIndex = Math.Min(splitTitleIndex, titleSplit.Length - 1);
            if (titleSplit.Length > 1) windowTitle = titleSplit[splitIndex];
        }
        if (windowTitle.Length == 0) { windowTitle = alternateTitle; }

        // short replacement strings
        text = text.Replace("$d", fullDateISO);
        text = text.Replace("$t", time);
        text = text.Replace("$ms", millisecond);
        text = text.Replace("$w", windowTitle);
        text = text.Replace("$c", counter);

        //text = text.Replace("$TAG1", GetTag(1)?.Name);
        text = text.Replace("$TAG", tagging.GetTagsText());

        // incrementing the counter happens in CaptureAction if the file is actually saved

        if (text.Contains("${")) // do Greenshot style text replacements
        {
            text = text.Replace("${DATE}", fullDateISO);
            text = text.Replace("${YYYY}", year);
            text = text.Replace("${MM}", month);
            text = text.Replace("${DD}", day);
            text = text.Replace("${hh}", hour);
            text = text.Replace("${mm}", minute);
            text = text.Replace("${ss}", second);
            text = text.Replace("${ms}", millisecond);
            text = text.Replace("${NUM}", counter);
            text = text.Replace("${title}", windowTitle);
            text = text.Replace("${user}", user);
            text = text.Replace("${domain}", domain);
            text = text.Replace("${hostname}", hostname);
        }

        return text;
    }
    #endregion

    #region Thumbnail

    private void AddThumbnail(string filepath, Bitmap? bitmap, bool allowFiletypeIcon = true)
    {
        if (bitmap == null) return;
        string displayName = Path.GetFileName(filepath);

        Image thumbImg;
        if (Path.GetExtension(displayName) == ".pdf" && allowFiletypeIcon)
        {
            thumbImg = ResizeThumbnail(bitmap, settings.ThumbnailWidth, settings.ThumbnailHeight, Settings.Default.CropThumbnails, Resources.pdf);
        }
        else
        {
            thumbImg = ResizeThumbnail(bitmap, settings.ThumbnailWidth, settings.ThumbnailHeight, Settings.Default.CropThumbnails);
        }

        imageList.Images.Add(thumbImg);
        thumbImg.Dispose();
        ListViewItem thumb;
        if (settings.AddThumbAtStartOfList)
        {
            thumb = listViewThumbnails.Items.Insert(0, displayName);
            if (listViewThumbnails.Items.Count > 0)
            {
                listViewThumbnails.Items[0].EnsureVisible();
            }
        }
        else
        {
            thumb = listViewThumbnails.Items.Add(displayName);
            int thumbcount = listViewThumbnails.Items.Count;
            if (thumbcount > 0)
            {
                listViewThumbnails.Items[thumbcount - 1].EnsureVisible();
            }
        }

        thumb.Text = displayName;
        thumb.Tag = filepath;
        thumb.ImageIndex = imageList.Images.Count - 1;
    }

    private void AddThumbnailFromFile(string filepath)
    {
        string extension = Path.GetExtension(filepath).ToLower();
        Bitmap? fileBitmap = null;
        bool doDispose = false;
        if (extension.Length > 0 && ImageOutput.SupportedImageFormatExtensions.Contains(extension))
        {
            try
            {
                using FileStream stream = new(filepath, FileMode.Open);
                fileBitmap = (Bitmap)Image.FromStream(stream);
                doDispose = true;
            }
            catch
            {
                Debug.WriteLine($"Failed to load image {filepath}");
            }
            if (fileBitmap == null)
            {
                fileBitmap = Resources.thumbunknown;
                doDispose = false;
            }
        }
        else if (extension == ".pdf")
        {
            fileBitmap = Resources.thumbpdf;
        }
        else
        {
            fileBitmap = Resources.thumbunknown;
        }

        AddThumbnail(filepath, fileBitmap, false);
        if (doDispose) fileBitmap.Dispose();
    }

    /// <summary>
    /// Resize the image to the specified width and height.
    /// </summary>
    /// <param name="image">The image to resize.</param>
    /// <param name="width">The width to resize to.</param>
    /// <param name="height">The height to resize to.</param>
    /// <param name="crop">Crop the image</param>
    /// <param name="fileTypeIcon">Optional overlay image placed in the corner of the image</param>
    /// <returns>The resized image.</returns>
    public static Bitmap ResizeThumbnail(Image image, int width, int height, bool crop = false, Bitmap? fileTypeIcon = null)
    {
        Rectangle thumbRect;
        Bitmap thumbImage = new(width, height);

        Image cropped;
        if (crop)
        {
            cropped = CropImageToAspectRatio(image, Settings.Default.ThumbnailWidth, Settings.Default.ThumbnailHeight);
        }
        else
        {
            cropped = image;
        }

        using (var graphics = Graphics.FromImage(thumbImage))
        {
            if (cropped.Width < width && cropped.Height < height)
            {
                //crisp drawing of small images
                graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
            }

            float ratioFrame = (float)width / (float)height;
            float ratioImageW = (float)cropped.Width / (float)cropped.Height;
            float ratioImageH = (float)cropped.Height / (float)cropped.Width;
            if (ratioImageW < ratioFrame)
            {
                float marginHorz = width - (height * ratioImageW);
                thumbRect = new Rectangle((int)(marginHorz / 2f), 0, (int)(width - marginHorz), height);
            }
            else
            {
                float marginVert = height - (width * ratioImageH);
                thumbRect = new Rectangle(0, (int)(marginVert / 2f), width, (int)(height - marginVert));
            }
            graphics.DrawImage(cropped, new Rectangle(Math.Max(thumbRect.X, 0), Math.Max(thumbRect.Y, 0), Math.Min(thumbRect.Width, width), Math.Min(thumbRect.Height, height)));

            if (fileTypeIcon != null)
            {
                graphics.DrawImageUnscaled(fileTypeIcon, 0, 0);
            }
        }
        return thumbImage;
    }

    private static Image CropImageToAspectRatio(Image img, int aspectRatioWidth, int aspectRatioHeight)
    {
        int width = img.Width;
        int height = img.Height;
        Rectangle cropArea;
        float aspectRatioImg = (float)width / (float)height;
        float aspectRatioCrop = (float)aspectRatioWidth / (float)aspectRatioHeight;
        float aspectRatioCropInvert = (float)aspectRatioHeight / (float)aspectRatioWidth;

        Debug.WriteLine("Crop from: " + img.Width + "x" + img.Height + " to: " + aspectRatioWidth + "x" + aspectRatioHeight);

        if (aspectRatioImg == aspectRatioCrop)
        {
            Debug.WriteLine("Crop aspectratio match: " + aspectRatioImg + " / " + aspectRatioCrop);
            return img;
        }

        if (aspectRatioImg > aspectRatioCrop) //input img is wider than output crop
        {
            int newWidth = (int)(img.Height * aspectRatioCrop); //could be 1 pixel off...
            Debug.WriteLine("Wider img, Crop width: " + newWidth + " from " + img.Height + ":" + aspectRatioCrop);
            int overflow = img.Width - newWidth;
            int overflowLeft = overflow / 2;
            cropArea = new Rectangle(overflowLeft, 0, width - overflow, height);
            Debug.WriteLine("Wider img, Crop size: " + cropArea);
        }
        else //input img is taller than output crop
        {
            int newHeight = (int)(img.Width * aspectRatioCropInvert); //could be 1 pixel off...
            Debug.WriteLine("Taller img, Crop height: " + newHeight + " from " + img.Width + ":" + aspectRatioCropInvert);
            int overflow = img.Height - newHeight;
            int overflowTop = overflow / 2;
            cropArea = new Rectangle(0, overflowTop, width, height - overflow);
            Debug.WriteLine("Taller img, Crop size: " + cropArea);
        }

        Bitmap bmpImage = new Bitmap(img);
        return bmpImage.Clone(cropArea, bmpImage.PixelFormat);
    }
    #endregion

    #region Save Image
    private void SetImageFormat()
    {
        string DestinationFileExtension = settings.FileExtension;
        DestinationFormat = DestinationFileExtension switch
        {
            ".jpg" => ImageFormat.Jpeg,
            ".png" => ImageFormat.Png,
            ".gif" => ImageFormat.Gif,
            ".bmp" => ImageFormat.Bmp,
            ".tiff" => ImageFormat.Tiff,
            _ => ImageFormat.Jpeg,
        };
    }

    private bool SaveBitmap(string folder, string filename, ImageFormat format, Bitmap capture)
    {
        //folder = MakeValidDirectoryName(folder);
        folder = MakeValidDirectoryName(folder);
        filename = MakeValidFileName(filename);
        if (folder.Length < 1)
        {
            folder = ".";
        }

        if (!Directory.Exists(folder))
        {
            try
            {
                Directory.CreateDirectory(folder);

                ShowBalloonToolTip("Folder Created", "Selected folder " + folder + " did not already exist.", ToolTipIcon.Info, BalloonTipType.FolderCreated);

            }
            catch
            {
                WriteMessage("Couldn't find or create folder " + folder);

                ShowBalloonToolTip("Capture error", "Couldn't find or create folder." + folder, ToolTipIcon.Warning, BalloonTipType.FolderError);

                return false;
            }
        }

        if (Directory.Exists(folder))
        {
            try
            {
                //Stopwatch sw = Stopwatch.StartNew();
                if (Path.GetExtension(filename).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    Debug.WriteLine("SaveBitmap: Saving to PDF instead of image");
                    SaveToPdf.Save(folder + "\\" + filename, capture, margins: 20f, imageScale: 0.87f);
                }
                else if (format == ImageFormat.Jpeg)
                {
                    SaveJpeg(folder + "\\" + filename, capture, settings.JpegQuality);
                }
                else
                {
                    //Debug.WriteLine("Saving image with format " + format.ToString() + " to " + folder + "\\" + filename);
                    capture.Save(folder + "\\" + filename, format);
                }
                //sw.Stop();
                //Debug.WriteLine($"Stopwatch, saved image in {sw.ElapsedMilliseconds}");
                WriteMessage("Saved " + folder + "\\" + filename);

                ShowBalloonToolTip("Capture saved", folder + Environment.NewLine + filename, ToolTipIcon.Info, BalloonTipType.ScreenshotSaved);

                lastSavedFile = folder + "\\" + filename;
                lastFolder = folder;
            }
            catch (Exception ex)
            {
                WriteMessage("Could not save file to:\n"
                    + folder + "\\" + filename + "\n"
                    + "Check that you have write permission for this folder\n"
                    + "\n"
                    + ex.Message);

                ShowBalloonToolTip("Capture error", "Couldn't save to folder." + folder + "\nCheck permission for this folder\n", ToolTipIcon.Warning, BalloonTipType.FolderError);

                return false;
            }
        }
        else
        {
            //this shouldn't be reachable
            WriteMessage("Folder not found: " + folder);

            ShowBalloonToolTip("Capture error", "Folder not found: " + folder, ToolTipIcon.Warning, BalloonTipType.FolderError);

            return false;
        }
        return true;
    }

    // https://stackoverflow.com/questions/1484759/quality-of-a-saved-jpg-in-c-sharp
    public static void SaveJpeg(string path, Bitmap image, long quality = 95L)
    {
        //Debug.WriteLine("Saving JPEG with quality " + quality);
        using EncoderParameters encoderParameters = new EncoderParameters(1);
        using EncoderParameter encoderParameter = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, quality);
        ImageCodecInfo codecInfo = ImageCodecInfo.GetImageDecoders().First(codec => codec.FormatID == ImageFormat.Jpeg.Guid);
        encoderParameters.Param[0] = encoderParameter;
        image.Save(path, codecInfo, encoderParameters);
    }

    #endregion

    #region save clipboard image to file, drop or fix format

    private static void DeletFileDropFiles()
    {
        Debug.WriteLine($"Deleting temp drop files");
        string filedropFolder;
        try
        {
            filedropFolder = Path.GetFullPath(FileDropTempFolder);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting drop folder path {FileDropTempFolder}\n{ex.Message}");
            return;
        }

        if (Directory.Exists(filedropFolder))
        {
            foreach (string file in Directory.GetFiles(filedropFolder))
            {
                if (file.Contains("clipboardImage")) // don't accidentally delete a lot of other files if something weird happens!
                {
                    try
                    {
                        File.Delete(file);
                        Debug.WriteLine($"Deleting temp drop file {file}");
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine($"Error deleting file {file}, exception {ex.Message}");
                    }
                }
                else
                {
                    Debug.WriteLine($"Skip deleting unexpected file in drop folder {file}");
                }
            }
        }
        else
        {
            Debug.WriteLine($"No temp drop file folder at {filedropFolder}");
        }
    }

    private void ClipboardImageToFileDrop()
    {
        if (ClipboardHelpers.ContainsImage() == false)
        {
            MessageBox.Show("Clipboard does not contain a valid image");
            return;
        }
        string filePath = FileDropTempFolder + @"\clipboardImage $d $t" + "." + DestinationFormat.ToString().ToLowerInvariant();
        filePath = Path.GetFullPath(filePath);
        filePath = filePath.Replace(".jpeg", ".jpg");

        filePath = ComposeFileName(filePath);

        CreateFileFromClipboardImage(filePath);
        if (File.Exists(filePath))
        {
            Debug.WriteLine($"File created, adding to drop list, file: {filePath}");
            StringCollection fileDropList = [filePath];
            if (ClipboardHelpers.SetFileList(fileDropList) == false)
            {
                WriteMessage("Error when adding file drop to clipboard");
            }
        }
        else
        {
            Debug.WriteLine($"Error, file not created: {filePath}");
            WriteMessage($"Error, file not created: {filePath}");
        }
    }

    private void ClipboardImageToSaveFile()
    {
        if (ClipboardHelpers.ContainsImage() == false)
        {
            MessageBox.Show("Clipboard does not contain a valid image");
            return;
        }
        SaveFileDialog dialog = new()
        {
            Filter = ImageOutput.FilterSaveImage,
            FileName = ComposeFileName("ClipboardImage $d $t")
        };
        DialogResult result = dialog.ShowDialog();
        string filePath = dialog.FileName;
        if (result == DialogResult.OK)
        {
            Debug.WriteLine($"Saving clipboard image to file {filePath}");
            CreateFileFromClipboardImage(filePath);
        }
    }

    private void CreateFileFromClipboardImage(string filePath)
    {
        string DestinationFileExtension = settings.FileExtension;
        //string DestinationFolder = ComposeFileName(settings.Foldername, "Clipboard");
        string? DestinationFolder = Path.GetDirectoryName(filePath);
        string? DestinationFileName = Path.GetFileName(filePath);
        ImageFormat format = DestinationFormat;

        if (DestinationFileName.Contains('.'))
        {
            format = ImageOutput.ImageFormatFromExtension(filePath);
            string possibleExtension = Path.GetExtension(filePath);
            if (possibleExtension.Length > 2)
            {
                DestinationFileExtension = Path.GetExtension(filePath);
            }
            Debug.WriteLine($"Using format from filename {format} from file name {filePath}");
        }
        //ComposeFileName(settings.Filename, "Region");
        Image? bmp = ClipboardHelpers.GetImage();
        if (bmp != null && DestinationFolder != null && DestinationFileName != null)
        {
            bool saved = SaveBitmap(DestinationFolder, Path.GetFileNameWithoutExtension(DestinationFileName) + DestinationFileExtension, format, (Bitmap)bmp);
            Debug.WriteLine($"Save success: {saved} to file {DestinationFolder} {DestinationFileExtension} {DestinationFileName} {DestinationFormat}");
        }
        else
        {
            MessageBox.Show("Clipboard image could not be processed, image is null");
        }
    }

    private void FixClipboardImage()
    {
        // loads and sets the clipboard image to convert from an unpasteable image type to a more compatible one
        if (ClipboardHelpers.ContainsImage())
        {
            Image? img = null;
            try
            {
                img = ClipboardHelpers.GetImage();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Exception when getting image from clipboard\n{ex.Message}");
                WriteMessage("Error: Could not get image from clipboard, possibly in use by other application.");
            }
            if (img != null)
            {
                try
                {
                    ClipboardHelpers.SetImage(img);
                    Debug.WriteLine($"Fixed clipboard image");
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Exception when setting image to clipboard\n{ex.Message}");
                    WriteMessage("Error: Could not add image to clipboard, possibly in use by other application.");
                }
            }
        }
    }
    #endregion

    #region active window location

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;        // x position of upper-left corner  
        public int Top;         // y position of upper-left corner  
        public int Right;       // x position of lower-right corner  
        public int Bottom;      // y position of lower-right corner  
        public readonly int Width
        {
            get
            {
                return Right - Left;
            }
        }
        public readonly int Height
        {
            get
            {
                return Bottom - Top;
            }
        }
    }

    private static string GetActiveWindowTitle()
    {
        const int nChars = 256;
        StringBuilder Buff = new StringBuilder(nChars);
        IntPtr handle = GetForegroundWindow();

        if (GetWindowText(handle, Buff, nChars) > 0)
        {
            return Buff.ToString();
        }
        return string.Empty;
    }
    #endregion

    #region Open item
    public string BrowseFolderInExplorer(string folder)
    {
        if (folder.Length < 1)
        {
            folder = ".";
        }
        if (Directory.Exists(folder))
        {
            Process.Start(new ProcessStartInfo() { FileName = folder, UseShellExecute = true });
        }
        else
        {
            WriteMessage("Can't open folder " + folder);
        }

        return folder;
    }

    public string BrowseFileInExplorer(string file)
    {
        if (file.Length < 1)
        {
            file = ".";
        }
        if (File.Exists(file))
        {
            Debug.WriteLine("Opening file: " + file);
            Process.Start("explorer.exe", $"/select,\"{file}\""); //string.Format("/select,\"{0}\"", file));
        }
        else
        {
            WriteMessage("Can't open file " + file);
        }

        return file;
    }


    private void OpenSelectedImageExternal()
    {
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            ListViewItem item = listViewThumbnails.SelectedItems[0];
            if (item != null)
            {
                string itemFile = "";
                if (item.Tag != null)
                {
                    itemFile = item.Tag.ToString() + "";
                }
                if (itemFile.Length > 0)
                {
                    OpenFileExternal(itemFile);
                }
            }
        }
    }

    private void OpenFileExternal(string file)
    {
        if (File.Exists(file))
        {
            Process.Start(new ProcessStartInfo() { FileName = file, UseShellExecute = true });
        }
        else
        {
            WriteMessage("Can't open file, it no longer exists: " + file);
        }
    }

    #endregion

    #region Open Forms
    private void OpenOptions()
    {
        if (options == null || options.IsDisposed)
            options = new Options(this);
        options.Show();
        options.WindowState = FormWindowState.Normal;
        SetForegroundWindow(options.Handle);
    }

    public void OpenHelp(string gotoPhrase = "")
    {
        helpWindow ??= new HelpForm();
        if (helpWindow.IsDisposed)
        {
            helpWindow = new HelpForm();
        }
        helpWindow.Show();
        helpWindow.WindowState = FormWindowState.Normal;
        if (gotoPhrase != "")
        {
            helpWindow.ScrollToText(gotoPhrase);
        }
    }
    #endregion

    #region click events --------------------------------------------------------
    private void ButtonOpenLastFolder_Click(object sender, EventArgs e)
    {
        BrowseFolderInExplorer(lastFolder);
    }

    private void ButtonOptions_Click(object sender, EventArgs e)
    {
        OpenOptions();
    }


    private void ListView1_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Delete)
        {
            DeleteSelectedFiles();
            e.Handled = true;
        }
        if (e.KeyCode == Keys.Enter)
        {
            OpenSelectedImageExternal();
            e.Handled = true;
        }
        else
        {
            e.Handled = false;
        }

    }

    private void DeleteSelectedFiles()
    {
        bool recycle = settings.DeleteToRecycleBin && ModifierKeys != Keys.Shift;
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            foreach (ListViewItem item in listViewThumbnails.SelectedItems)
            {
                string deleteFile = "";
                if (item.Tag != null)
                    deleteFile = item.Tag.ToString() + "";
                if (File.Exists(deleteFile))
                {
                    try
                    {
                        if (recycle)
                        {
                            FileSystem.DeleteFile(deleteFile, UIOption.AllDialogs, RecycleOption.SendToRecycleBin, UICancelOption.DoNothing);
                            //Debug.WriteLine($"Sending file to recycle bin: {deleteFile}");
                        }
                        else
                        {
                            File.Delete(deleteFile);
                            //Debug.WriteLine("Hard-deleted file " + deleteFile);
                        }
                        item.Remove();
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine("Couldn't delete file: " + item.Tag?.ToString());
                        Debug.WriteLine(ex.ToString());
                    }
                }
                else
                {
                    WriteMessage("File no longer exists, removing from list: " + deleteFile);
                    item.Remove();
                }
                //item.Remove();

            }

        }
        UpdateInfoLabelVisibility();
    }

    private void RenameSelectedFile()
    {
        if (listViewThumbnails.SelectedItems.Count < 1) return;

        ListViewItem item = listViewThumbnails.SelectedItems[0];
        string? oldFileName = item.Tag?.ToString();
        if (oldFileName == null || File.Exists(oldFileName) == false)
        {
            MessageBox.Show("File not found, cancelling rename.");
            return;
        }

        TextEntryDialog textEntryDialog = new TextEntryDialog(oldFileName, true, false);
        DialogResult result = textEntryDialog.ShowDialog();
        if (result == DialogResult.OK)
        {
            string newFileName = textEntryDialog.TextResult;

            string? newDirectoryName = Path.GetDirectoryName(newFileName);
            if (Directory.Exists(newDirectoryName) == false)
            {
                DialogResult createDirectoryResult = MessageBox.Show($"Folder does not exist:\n{Path.GetDirectoryName(newFileName)}\nDo you want to create the folder?", "Create folder?", MessageBoxButtons.OKCancel);
                if (createDirectoryResult == DialogResult.OK)
                {
                    try
                    {
                        if (newDirectoryName == null)
                        {
                            MessageBox.Show($"Could not determine directory name:\n{newDirectoryName}");
                            return;
                        }
                        Directory.CreateDirectory(newDirectoryName);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Could not create directoy:\n{ex}");
                        return;
                    }
                }
                else
                {
                    return;
                }
            }


            try
            {
                if (File.Exists(newFileName))
                {
                    DialogResult overwriteResult = MessageBox.Show($"File already exists.\nDo you want to overwrite the file {Path.GetFileName(newFileName)}", "Replace File?", MessageBoxButtons.YesNo);
                    if (overwriteResult == DialogResult.No) return;
                }
                File.Move(oldFileName, newFileName, overwrite: true);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error moving file\nfrom: {oldFileName}\nto: {newFileName}\n\n{ex.Message}");
                return;
            }

            item.Tag = textEntryDialog.TextResult;
            item.Text = Path.GetFileName(newFileName);
        }
    }

    private void ButtonClearList_Click(object sender, EventArgs e)
    {

        //foreach (Image img in imageList.Images)
        //{
        //    img?.Dispose(); // TODO: maybe not needed, causes lag? Check RAM used with or without
        //}
        imageList.Images.Clear();
        listViewThumbnails.Clear();
        UpdateInfoLabelVisibility();
    }



    private void NotifyIcon1_DoubleClick(object sender, EventArgs e)
    {
        ShowApplication();
    }

    private void ButtonHide_Click(object sender, EventArgs e)
    {
        Hide();
    }

    private void TimerHide_Tick(object sender, EventArgs e)
    {
        Hide();
        timerHide.Stop();
    }

    private void OpenProgramToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ShowApplication();
    }

    private void ExitApplicationToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ExitProgram();
    }

    private void OpenFileToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenFileExternal(lastSavedFile);
    }

    private void EnableCroppingToolStripMenuItem_Click(object sender, EventArgs e)
    {
        settings.TrimChecked = !settings.TrimChecked;
        settings.Save();
        UpdateTrimStatus();
    }

    private void ShowTagView_Click(object sender, EventArgs e)
    {
        tagging.ShowTagView();
    }

    #endregion

    #region Balloon Tip ----------------------------------------------------------------

    private BalloonTipType lastBallonTip = BalloonTipType.NotSet;

    private void ShowBalloonToolTip(string title, string text, ToolTipIcon icon, BalloonTipType tipType)
    {

        int timeout = 1000;


        bool showToolTip = false;

        if (tipType == BalloonTipType.ScreenshotSaved && settings.AllowTrayTooltipInfoCapture)
            showToolTip = true;
        else if (tipType == BalloonTipType.FolderCreated && settings.AllowTrayTooltipInfoFolder)
            showToolTip = true;
        else if (tipType >= BalloonTipType.Error && settings.AllowTrayTooltipWarning)
            showToolTip = true;

        if (showToolTip)
        {
            //Debug.WriteLine("Showing Balloon tip: " + tipType.ToString());
            lastBallonTip = tipType;
            notifyIcon1.ShowBalloonTip(timeout, title, text, icon);
        }
        else
        {
            //Debug.WriteLine("Supressing Balloon tip: " + tipType.ToString());
        }
    }

    private enum BalloonTipType
    {
        NotSet,
        ScreenshotSaved,
        FolderCreated,
        Error, // only errors below this enum
        FolderError,
        ScreenshotError,
        HotkeyError
    }

    private void NotifyIcon1_BalloonTipClicked(object sender, EventArgs e)
    {
        Debug.WriteLine("Balloon clicked, last type: " + lastBallonTip.ToString());
        if (lastBallonTip == BalloonTipType.FolderCreated)
        {
            Debug.WriteLine("Balloon click, Open last image: " + lastFolder);
            BrowseFolderInExplorer(lastFolder);
        }
        if (lastBallonTip == BalloonTipType.ScreenshotSaved)
        {
            Debug.WriteLine("Balloon click, Open last image: " + lastSavedFile);
            OpenFileExternal(lastSavedFile);
        }
        if (lastBallonTip >= BalloonTipType.Error)
        {
            Debug.WriteLine("Balloon click, Error, open Options");
            OpenOptions();
        }
    }

    #endregion

    #region Log view and info
    private void WriteMessage(string text)
    {
        textBoxLog.Text = text + Environment.NewLine + textBoxLog.Text;
    }

    private void LabelShowLog_Click(object sender, EventArgs e)
    {
        showLog = !showLog;
        UpdateLogVisible();
    }

    private void UpdateLogVisible()
    {
        int logHeight = 100;
        int logMargin = 10;
        int internalWidth = this.ClientSize.Width;
        int internalCenter = internalWidth / 2;
        int internalHeight = this.ClientSize.Height;

        if (showLog)
        {
            labelShowLog.Text = "Hide log";
            listViewThumbnails.Size = new Size(internalWidth - (logMargin * 2), internalHeight - logHeight - labelShowLog.Height - 40);
            labelShowLog.Location = new Point((internalCenter) - (labelShowLog.Width / 2), internalHeight - logHeight - labelShowLog.Height - 5);
            textBoxLog.Location = new Point(logMargin, internalHeight - logHeight);
            textBoxLog.Visible = true;
            textBoxLog.Size = new Size(internalWidth - (logMargin * 2), logHeight - 5);
        }
        else
        {
            labelShowLog.Text = "Show log";
            labelShowLog.Location = new Point((internalCenter) - (labelShowLog.Width / 2), internalHeight - labelShowLog.Height - 5);
            textBoxLog.Visible = false;
            listViewThumbnails.Size = new Size(internalWidth - (logMargin * 2), internalHeight - labelShowLog.Height - 40);
        }
    }

    private void UpdateInfoLabelVisibility(bool forceHide = false)
    {
        if (listViewThumbnails.Items.Count > 0 || forceHide)
        {
            labelInfo.Visible = false;
        }
        else
        {
            labelInfo.Visible = true;
        }
    }

    private void UpdateLabelInfoPosition()
    {
        int widthAvailable = listViewThumbnails.Width - labelInfo.Width;
        int HeightAvailable = listViewThumbnails.Height - labelInfo.Height;
        labelInfo.Location = new Point(Math.Max(listViewThumbnails.Left + 5, widthAvailable / 2), Math.Max(listViewThumbnails.Top + 5, HeightAvailable / 2));
        if (labelInfo.Height + 5 > listViewThumbnails.Height)
        {
            UpdateInfoLabelVisibility(forceHide: true);
        }
        else
        {
            UpdateInfoLabelVisibility();
        }
    }

    public void SetInfoText()
    {
        labelInfo.Text = "To take a screenshot press:\n\n";
        //List<string> hotkeyLines = new List<string>();
        foreach (KeyValuePair<string, Hotkey> entry in HotkeyList)
        {
            //hotkeyLines.Add(entry.Key + ": " + entry.Value.ToString());
            string keyName = CamelCaseToSpaces(entry.Key).PadRight(25);
            labelInfo.Text += $"{keyName} :  {entry.Value} \n";
        }
        labelInfo.Text += "\nChange hotkeys in Options.";
    }

    public static string CamelCaseToSpaces(string text)
    {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < text.Length; i++)
        {
            if (char.IsUpper(text[i]) && i > 0)
            {
                sb.Append(' ');
            }
            sb.Append(text[i]);
        }
        return sb.ToString();
    }
    #endregion

    #region Menu items and clicks
    private void ItemOpenImage_Click(object sender, EventArgs e)
    {
        // open first selected image in external viewer
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            object? tag = listViewThumbnails.SelectedItems[0].Tag;
            if (tag != null)
            {
                OpenFileExternal(tag.ToString() + "");
            }
        }
    }

    private void ItemRemove_Click(object sender, EventArgs e)
    {
        // remove all selected items from list, without deleting the file
        foreach (ListViewItem item in listViewThumbnails.SelectedItems)
        {
            item.Remove(); // TODO check that images are disposed when removing item, to save RAM
        }
        UpdateInfoLabelVisibility();
    }

    private void ItemDeleteFile_Click(object sender, EventArgs e)
    {
        // delete selected files
        DeleteSelectedFiles();
    }

    private void ItemRenameFile_Click(Object sender, EventArgs e)
    {
        // open prompt to rename file and possibly move it to a subfolder
        RenameSelectedFile();
    }

    private void ItemOpenFolder_Click(object sender, EventArgs e)
    {
        // open folder of first selected file
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            if (listViewThumbnails.SelectedItems[0].Tag is string filename)
            {
                //string? file = listViewThumbnails.SelectedItems[0].Tag?.ToString();
                //if (file == null) return;
                string? folder = Path.GetDirectoryName(filename);
                Debug.WriteLine($"open folder from filename {filename}: {folder}");
                if (folder == null) return;
                BrowseFolderInExplorer(folder);
            }
        }
    }

    private void ItemOpenFileInExplorer_Click(object sender, EventArgs e)
    {
        // open folder of first selected file
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            if (listViewThumbnails.SelectedItems[0].Tag is string filename)
            {
                //string? file = listViewThumbnails.SelectedItems[0].Tag?.ToString();
                //if (file == null) return;
                //string? folder = Path.GetDirectoryName(filename);
                Debug.WriteLine($"open file {filename}");
                BrowseFileInExplorer(filename);
                //if (folder == null) return;
                //BrowseFolderInExplorer(folder);
            }
        }
    }

    private void CopyToClipboardToolStripMenuItem_Click(object sender, EventArgs e)
    {
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            string? file = listViewThumbnails.SelectedItems[0].Tag?.ToString();
            if (file == null) return;
            if (File.Exists(file))
            {
                try
                {
                    Image toClipboard = Image.FromFile(file);
                    ClipboardHelpers.SetImage(toClipboard);
                    toClipboard.Dispose();
                }
                catch
                {
                    WriteMessage("Copy to clipboard failed, error while opening file " + file);
                }
            }
            else
            {
                WriteMessage("Copy to clipboard failed, file no longer exists " + file);
            }
        }
    }

    private void ResetCounterToolStripMenuItem_Click(object sender, EventArgs e)
    {
        SetCounter(1);
    }

    private void ExitToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ExitProgram();
    }

    private void HelpofflineCopyToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenHelp();
    }

    private void HelponGithubToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenDocumentation();
    }

    private void ChangelogToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenWebsiteChangelog();
    }

    private void WebsiteToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenWebsite();
    }

    private void AboutToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenAbout();
    }

    public static void OpenLink(string url)
    {
        Process.Start(new ProcessStartInfo() { FileName = url, UseShellExecute = true });
    }

    public static void OpenWebsite()
    {
        OpenLink("https://github.com/snjo/ScreenShotTool/");
    }

    public static void OpenWebsiteChangelog()
    {
        OpenLink("https://github.com/snjo/ScreenShotTool/blob/master/changelog.md");
    }

    public static void OpenDocumentation()
    {
        OpenLink("https://github.com/snjo/ScreenShotTool/blob/master/README.md");
    }

    public static void OpenAbout()
    {
        About aboutWindow = new About();
        aboutWindow.Show();
        aboutWindow.WindowState = FormWindowState.Normal;
    }

    private void CopyFileMenuItem_Click(object sender, EventArgs e)
    {
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            Debug.WriteLine("Copying files to clipboard");

            StringCollection fileList = [];

            foreach (ListViewItem item in listViewThumbnails.SelectedItems)
            {

                string file = item.Tag?.ToString() + "";
                if (File.Exists(file))
                {
                    fileList.Add(file);
                }
                else
                {
                    WriteMessage("File no longer exists, can't copy: " + file);
                }
            }
            ClipboardHelpers.Clear();
            if (fileList.Count > 0)
            {
                ClipboardHelpers.SetFileList(fileList);
            }
        }
    }

    private void EditImageFromFile_Click(object sender, EventArgs e)
    {
        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            string? file = listViewThumbnails.SelectedItems[0].Tag?.ToString();
            if (File.Exists(file))
            {
                ScreenshotEditor imageEditor = new ScreenshotEditor(file);
                imageEditor.Show();
                imageEditor.BringToFront();
            }
        }
    }

    private void EditImageNoFile_Click(object sender, EventArgs e)
    {
        ScreenshotEditor imageEditor = new ScreenshotEditor();
        imageEditor.Show();
    }

    private void EditImageFromClipboard_Click(object sender, EventArgs e)
    {
        ScreenshotEditor imageEditor = new ScreenshotEditor(true);
        imageEditor.Show();
    }

    private void EditorToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ScreenshotEditor imageEditor = new ScreenshotEditor();
        imageEditor.Show();
    }

    private void HelpToolStripMenuItem_Click(object sender, EventArgs e)
    {
        OpenHelp();
    }


    private void ConvertFileFormat_Click(object sender, EventArgs e)
    {
        if (listViewThumbnails.SelectedItems.Count == 0) return;
        int filterIndex = 1;
        int filesRemaining = listViewThumbnails.SelectedItems.Count;
        bool skippedPDF = false;
        foreach (ListViewItem item in listViewThumbnails.SelectedItems)
        {
            filesRemaining--;

            if (item.Tag is string filename)
            {
                if (Path.GetExtension(filename).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    Debug.WriteLine("Skipping pdf file");
                    skippedPDF = true;
                    continue;
                }
                if (File.Exists(filename) == false) return;
                try
                {
                    bool resume;
                    using Bitmap outImage = (Bitmap)Image.FromFile(filename);
                    string nameSuggestion = Path.GetFileNameWithoutExtension(filename);
                    (resume, filterIndex) = ImageOutput.SaveWithDialog(outImage, ImageOutput.FilterSaveImage, nameSuggestion, filterIndex);
                    if (resume == false && filesRemaining > 0)
                    {
                        if (MessageBox.Show("Cancel or error detected. Do you want to continue converting files", "Resume converting?", MessageBoxButtons.YesNo) == DialogResult.No)
                        {
                            break;
                        }
                    }

                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Couldn't save file {filename}, {ex.Message}");
                    MessageBox.Show($"Couldn't save file {filename}, {ex.Message}");
                }
            }
        }
        if (skippedPDF)
        {
            MessageBox.Show("Some files were skipped, converting PDFs to other formats is currently not supported.");
        }
    }

    private void CopyClipboardToFileToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ClipboardImageToFileDrop();
    }

    private void SaveClipboardToFileToolStripMenuItem_Click(object sender, EventArgs e)
    {
        ClipboardImageToSaveFile();
    }

    private void FixClipboardImageMenuItem_Click(object sender, EventArgs e)
    {
        FixClipboardImage();
    }
    #endregion

    #region ListView

    private void ListViewThumbnails_SizeChanged(object sender, EventArgs e)
    {
        UpdateLabelInfoPosition();
    }

    private void ListView1_DoubleClick(object sender, EventArgs e)
    {
        OpenSelectedImageExternal();
    }

    private void ListViewThumbnails_MouseDown(object sender, MouseEventArgs e)
    {

        if (e.Button == MouseButtons.Right)
        {
            var focusedItem = listViewThumbnails.FocusedItem;
            if (focusedItem != null && focusedItem.Bounds.Contains(e.Location))
            {
                contextMenuListView.Show(Cursor.Position);
            }
        }
    }

    private void ContextMenuListView_Opening(object sender, System.ComponentModel.CancelEventArgs e)
    {
        if (!contextMenuListView.Visible) return;
        bool convertableImages = false;

        if (listViewThumbnails.SelectedItems.Count > 0)
        {
            for (int i = 0; i < listViewThumbnails.SelectedItems.Count; i++)
            {
                if (listViewThumbnails.SelectedItems[i].Tag is string filename)
                {
                    Debug.WriteLine($"item tag is {filename}");
                    bool isImage = false;
                    string extension = Path.GetExtension(filename);
                    if (ImageOutput.IsSupportedImageFormat(extension))
                    {
                        isImage = true;
                        convertableImages = true;
                    }
                    if (i == 0)
                    {
                        copyToClipboardToolStripMenuItem.Enabled = isImage;
                        editImageToolStripMenuItem.Enabled = isImage;
                    }
                }
                else
                {
                    Debug.WriteLine($"item tag is not string");
                }
            }
        }
        convertFileFormatToolStripMenuItem.Enabled = convertableImages;
    }

    private void ListViewThumbnails_DragEnter(object sender, DragEventArgs e)
    {
        DragDropMethods.FileDropDragEnter(this, e);
    }

    private void ListViewThumbnails_DragDrop(object sender, DragEventArgs e)
    {
        if (e.Data == null) return;
        List<string> fileNames = DragDropMethods.GetDroppedFileNames(e);

        for (int i = 0; i < fileNames.Count; i++)
        {
            AddThumbnailFromFile(fileNames[i]);
        }
        UpdateInfoLabelVisibility();
    }

    #endregion

    private void TimerCleanThumbnailList_Tick(object sender, EventArgs e)
    {
        TimeSpan timeSinceLastCapture = DateTime.Now - lastCaptureTime;
        TimeSpan minimumRestTime = TimeSpan.FromSeconds(60);
        if (timeSinceLastCapture > minimumRestTime)
        {
            int itemCount = listViewThumbnails.Items.Count;
            int maxItems = settings.MaxThumbnailsInList;
            //int maxItems = 3; //test
            int tooMany = itemCount - maxItems;
            if (itemCount > maxItems)
            {
                for (int i = 0; i < tooMany; i++)
                {
                    if (listViewThumbnails.Items.Count < 1) return;
                    int index = 0;
                    if (settings.AddThumbAtStartOfList)
                    {
                        index = listViewThumbnails.Items.Count - 1;
                    }

                    ListViewItem item = listViewThumbnails.Items[index];
                    imageList.Images[item.ImageIndex].Dispose();
                    listViewThumbnails.Items.Remove(item);
                }
            }
            UpdateInfoLabelVisibility();
        }
    }

    //private void FixTransparentPixels_Click(object sender, EventArgs e)
    //{
    //    if (listViewThumbnails.SelectedItems.Count == 0) return;
    //    foreach (ListViewItem item in listViewThumbnails.SelectedItems)
    //    {
    //        if (item.Tag is string filename)
    //        {
    //            if (Path.GetExtension(filename).Equals(".png", StringComparison.OrdinalIgnoreCase) == false)
    //            {
    //                Debug.WriteLine($"Skipping non-png file {filename}");
    //                continue;
    //            }
    //            if (File.Exists(filename) == false) return;
    //            try
    //            {
    //                Bitmap org = (Bitmap)Image.FromFile(filename);
    //                Bitmap bmp = ImageProcessing.CopyImage(org);
    //                org.Dispose();

    //                //string nameSuggestion = Path.GetFileNameWithoutExtension(filename) + "_fix.png";
    //                int fixes = ImageProcessing.FixTransparentPixels(bmp);
    //                bmp.Save(filename,ImageFormat.Png);
    //                bmp.Dispose();
    //                Debug.WriteLine($"Fixed transparency on {fixes} pixels. Save to file {filename}");
    //            }
    //            catch (Exception ex)
    //            {
    //                Debug.WriteLine($"Couldn't save file {filename}, {ex.Message}");
    //                MessageBox.Show($"Couldn't save file {filename}, {ex.Message}");
    //            }
    //        }
    //    }
    //}
}