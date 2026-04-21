using Hotkeys;
using ScreenShotTool.Classes;
using ScreenShotTool.Forms;
using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool
{
    [SupportedOSPlatform("windows")]
    public partial class Options : Form
    {
        readonly MainForm mainForm;
        readonly Settings settings = Settings.Default;
        //public static readonly string ApplicationName = "Screenshot Tool";

        public Options(MainForm parent)
        {
            InitializeComponent();
            Font = new Font(this.Font.FontFamily, 9);
            mainForm = parent;
            FillSettings();
        }

        private void FillSettings()
        {
            //Tab: Capture Output
            textBoxFolder.Text = settings.Foldername;

            textBoxFilename.Text = settings.Filename;
            comboBoxFileExtension.Text = settings.FileExtension;
            numericUpDownJpegQuality.SetValueClamped(settings.JpegQuality);

            textBoxAlternateTitle.Text = settings.AlternateTitle;
            numericUpDownTitleMaxLength.SetValueClamped(settings.TitleMaxLength);
            textBoxSplitString.Text = settings.SplitTitleString;
            numericUpDownSplitIndex.SetValueClamped(settings.SplitTitleIndex);

            checkBoxTrim.Checked = settings.TrimChecked;
            trimTop.Value = settings.TrimTop;
            trimBottom.Value = settings.TrimBottom;
            trimLeft.Value = settings.TrimLeft;
            trimRight.Value = settings.TrimRight;

            numericUpDownCounter.SetValueClamped(settings.Counter);

            //Tab: Modes
            checkBoxRegionComplete.Checked = settings.RegionCompletesOnMouseRelease;
            checkBoxRegionToFile.Checked = settings.RegionToFile;
            checkBoxRegionToEditor.Checked = settings.RegionToEditor;
            checkBoxRegionToClipboard.Checked = settings.RegionToClipboard;
            if (settings.RegionCompletesOnMouseRelease == false)
            {
                checkBoxRegionToFile.Enabled = false;
                checkBoxRegionToClipboard.Enabled = false;
                checkBoxRegionToEditor.Enabled = false;
            }
            checkBoxMaskRegion.Checked = settings.MaskRegion;
            checkBoxRegionCaptureUseAllScreens.Checked = settings.RegionCaptureUseAllScreens;

            checkBoxWindowToFile.Checked = settings.WindowToFile;
            checkBoxWindowToClipboard.Checked = settings.WindowToClipboard;
            checkBoxWindowToEditor.Checked = settings.WindowToEditor;

            checkBoxScreenToFile.Checked = settings.ScreenToFile;
            checkBoxScreenToClipboard.Checked = settings.ScreenToClipboard;
            checkBoxScreenToEditor.Checked = settings.ScreenToEditor;

            checkBoxAllScreensToFile.Checked = settings.AllScreensToFile;
            checkBoxAllScreensToClipboard.Checked = settings.AllScreensToClipboard;
            checkBoxAllScreensToEditor.Checked = settings.AllScreensToEditor;

            //Tab: Application
            checkBoxStartHidden.Checked = settings.StartHidden;
            checkBoxMinimizeOnClose.Checked = settings.MinimizeOnClose;
            checkBoxAutorun.Checked = Autorun.Autorun.IsEnabled(MainForm.ApplicationName);

            checkBoxTrayTooltipInfoCapture.Checked = settings.AllowTrayTooltipInfoCapture;
            checkBoxTrayTooltipInfoFolder.Checked = settings.AllowTrayTooltipInfoFolder;
            checkBoxTrayTooltipWarning.Checked = settings.AllowTrayTooltipWarning;

            checkBoxCropThumbnails.Checked = settings.CropThumbnails;
            numericThumbWidth.SetValueClamped(settings.ThumbnailWidth);
            numericThumbHeight.SetValueClamped(settings.ThumbnailHeight);
            checkBoxAddThumbAtStartOfList.Checked = settings.AddThumbAtStartOfList;
            numericMaxThumbnails.SetValueClamped(settings.MaxThumbnailsInList);

            numericUpDownFramerate.SetValueClamped(settings.MaxFramerate);

            checkBoxPreventDpiRescale.Checked = settings.PreventDpiRescale;

            checkBoxDeleteRecycle.Checked = settings.DeleteToRecycleBin;

            //Tab: Editor

            checkBoxSelectAfterPlacingSymbol.Checked = settings.SelectAfterPlacingSymbol;
            checkBoxSelectAfterFreehand.Enabled = checkBoxSelectAfterPlacingSymbol.Checked;
            checkBoxSelectAfterFreehand.Checked = settings.SelectAfterFreehand;

            ColorTools.SetButtonColors(buttonNumberedColor, settings.GsNumberedColor, true);
            ColorTools.SetButtonColors(buttonLineColor, settings.NewSymbolLineColor, true);
            ColorTools.SetButtonColors(buttonFillColor, settings.NewSymbolFillColor, true);
            numericLineWeight.SetValueClamped(settings.NewSymbolLineWeight);
            numericNumberedSize.SetValueClamped(settings.GsNumberedDefaultSize);

            numericBlurMosaicSize.SetValueClamped(settings.BlurMosaicSize);
            numericBlurSampleArea.SetValueClamped(settings.BlurSampleArea);

            textBoxStickerFolder.Text = settings.StickerFolder;

            //Tab: Hotkeys

            FillHotkeyGrid();
        }

        private void ButtonSelectFolder_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog dialog = new();
            dialog.ShowDialog();
            textBoxFolder.Text = dialog.SelectedPath;
        }

        private void ButtonOK_Click(object sender, EventArgs e)
        {
            ApplySettings();
            Close();
        }

        private void ApplySettings()
        {
            //Tab: Capture Output
            settings.Filename = textBoxFilename.Text;
            settings.Foldername = textBoxFolder.Text;
            settings.FileExtension = comboBoxFileExtension.Text;
            settings.JpegQuality = (long)numericUpDownJpegQuality.Value;

            settings.AlternateTitle = textBoxAlternateTitle.Text;
            settings.TitleMaxLength = numericUpDownTitleMaxLength.ValueInt();
            settings.SplitTitleString = textBoxSplitString.Text;
            settings.SplitTitleIndex = numericUpDownSplitIndex.ValueInt();

            settings.TrimChecked = checkBoxTrim.Checked;
            settings.TrimTop = trimTop.ValueInt();
            settings.TrimBottom = trimBottom.ValueInt();
            settings.TrimLeft = trimLeft.ValueInt();
            settings.TrimRight = trimRight.ValueInt();


            mainForm.SetCounter((int)numericUpDownCounter.Value, false);
            settings.Counter = mainForm.GetCounter();

            //Tab: Modes
            settings.RegionToFile = checkBoxRegionToFile.Checked;
            settings.RegionToClipboard = checkBoxRegionToClipboard.Checked;
            settings.RegionToEditor = checkBoxRegionToEditor.Checked;
            settings.RegionCompletesOnMouseRelease = checkBoxRegionComplete.Checked;
            settings.MaskRegion = checkBoxMaskRegion.Checked;
            settings.RegionCaptureUseAllScreens = checkBoxRegionCaptureUseAllScreens.Checked;

            settings.WindowToFile = checkBoxWindowToFile.Checked;
            settings.WindowToClipboard = checkBoxWindowToClipboard.Checked;
            settings.WindowToEditor = checkBoxWindowToEditor.Checked;

            settings.ScreenToFile = checkBoxScreenToFile.Checked;
            settings.ScreenToClipboard = checkBoxScreenToClipboard.Checked;
            settings.ScreenToEditor = checkBoxScreenToEditor.Checked;

            settings.AllScreensToFile = checkBoxAllScreensToFile.Checked;
            settings.AllScreensToClipboard = checkBoxAllScreensToClipboard.Checked;
            settings.AllScreensToEditor = checkBoxAllScreensToEditor.Checked;

            //Tab: Application
            settings.StartHidden = checkBoxStartHidden.Checked;
            settings.MinimizeOnClose = checkBoxMinimizeOnClose.Checked;
            if (checkBoxAutorun.Checked)
            {
                Autorun.Autorun.Enable(MainForm.ApplicationName);
            }
            else
            {
                Autorun.Autorun.Disable(MainForm.ApplicationName);
            }

            settings.CropThumbnails = checkBoxCropThumbnails.Checked;
            settings.ThumbnailWidth = numericThumbWidth.ValueInt();
            settings.ThumbnailHeight = numericThumbHeight.ValueInt();
            settings.AddThumbAtStartOfList = checkBoxAddThumbAtStartOfList.Checked;
            settings.MaxThumbnailsInList = numericMaxThumbnails.ValueInt();
            settings.AllowTrayTooltipInfoCapture = checkBoxTrayTooltipInfoCapture.Checked;
            settings.AllowTrayTooltipInfoFolder = checkBoxTrayTooltipInfoFolder.Checked;
            settings.AllowTrayTooltipWarning = checkBoxTrayTooltipWarning.Checked;

            settings.MaxFramerate = numericUpDownFramerate.ValueInt();

            settings.PreventDpiRescale = checkBoxPreventDpiRescale.Checked;

            settings.DeleteToRecycleBin = checkBoxDeleteRecycle.Checked;

            // Tab: Editor

            settings.SelectAfterPlacingSymbol = checkBoxSelectAfterPlacingSymbol.Checked;
            settings.SelectAfterFreehand = checkBoxSelectAfterFreehand.Checked;

            settings.NewSymbolLineColor = buttonLineColor.BackColor;
            settings.NewSymbolFillColor = buttonFillColor.BackColor;
            settings.NewSymbolLineWeight = numericLineWeight.ValueInt();

            settings.GsNumberedColor = buttonNumberedColor.BackColor;
            settings.GsNumberedDefaultSize = numericNumberedSize.ValueInt();

            settings.BlurMosaicSize = numericBlurMosaicSize.ValueInt();
            settings.BlurSampleArea = numericBlurSampleArea.ValueInt();

            settings.StickerFolder = textBoxStickerFolder.Text;

            //Tab: Hotkeys
            int i = 0;
            foreach (KeyValuePair<string, Hotkey> kvp in mainForm.HotkeyList)
            {
                string keyName = kvp.Key;
                if (HotkeyGrid.Rows[i].Cells[1].Value == null)
                {
                    HotkeyGrid.Rows[i].Cells[1].Value = "";
                }
                Properties.Settings.Default["hk" + keyName + "Key"] = HotkeyGrid.Rows[i].Cells[1].Value.ToString();

                settings["hk" + keyName + "Ctrl"] = Convert.ToBoolean(HotkeyGrid.Rows[i].Cells[2].Value);
                settings["hk" + keyName + "Alt"] = Convert.ToBoolean(HotkeyGrid.Rows[i].Cells[3].Value);
                settings["hk" + keyName + "Shift"] = Convert.ToBoolean(HotkeyGrid.Rows[i].Cells[4].Value);
                settings["hk" + keyName + "Win"] = Convert.ToBoolean(HotkeyGrid.Rows[i].Cells[5].Value);

                mainForm.HotkeyList[keyName] = GetHotkeyFromGrid(mainForm.HotkeyList[keyName], HotkeyGrid.Rows[i].Cells);

                i++;
            }


            Settings.Default.Save();

            ReloadHotkeys();
            mainForm.UpdateTrimStatus();
            mainForm.SetInfoText();
            //mainForm.SaveSettings();
            //using (SettingsRegistry sr = new())
            //{
            SettingsRegistry.SaveSettingsToRegistry();
            //}

        }

        private static Hotkey GetHotkeyFromGrid(Hotkey hotkey, DataGridViewCellCollection settingRow)
        {
            string settingKey = string.Empty;
            DataGridViewCell cell = settingRow[1];
            if (cell != null)
            {
                if (cell.Value != null)
                    settingKey = (string)cell.Value;
                settingKey ??= string.Empty;
            }

            if (settingKey.Length > 0)
                hotkey.Key = settingKey;
            else
                hotkey.Key = new string("");

            hotkey.Ctrl = Convert.ToBoolean(settingRow[2].Value);
            hotkey.Alt = Convert.ToBoolean(settingRow[3].Value);
            hotkey.Shift = Convert.ToBoolean(settingRow[4].Value);
            hotkey.Win = Convert.ToBoolean(settingRow[5].Value);

            return hotkey;
        }

        private void FillHotkeyGrid()
        {
            HotkeyGrid.Rows.Clear();
            HotkeyGrid.Rows.Add(mainForm.HotkeyList.Count);

            int i = 0;
            foreach (KeyValuePair<string, Hotkey> kvp in mainForm.HotkeyList)
            {
                string keyName = MainForm.CamelCaseToSpaces(kvp.Key);
                Hotkey hotkey = kvp.Value;
                HotkeyGrid.Rows[i].Cells[0].Value = keyName;
                HotkeyGrid.Rows[i].Cells[1].Value = hotkey.Key;
                HotkeyGrid.Rows[i].Cells[2].Value = hotkey.Ctrl;
                HotkeyGrid.Rows[i].Cells[3].Value = hotkey.Alt;
                HotkeyGrid.Rows[i].Cells[4].Value = hotkey.Shift;
                HotkeyGrid.Rows[i].Cells[5].Value = hotkey.Win;
                i++;
            }
        }

        private void ButtonApply_Click(object sender, EventArgs e)
        {
            ApplySettings();
        }

        private void ButtonCancel_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void ButtonHelp_Click(object sender, EventArgs e)
        {
            mainForm.OpenHelp("Application options");
        }

        private void ButtonBrowseFolder_Click(object sender, EventArgs e)
        {
            string folder = textBoxFolder.Text;
            if (Directory.Exists(folder))
            {
                mainForm.BrowseFolderInExplorer(folder);
            }
            else
            {
                string folderParent = Path.GetDirectoryName(textBoxFolder.Text) + "";
                Debug.WriteLine("Couldn't open directory " + folder + ", trying to open " + folderParent);
                mainForm.BrowseFolderInExplorer(folderParent);
            }
        }

        private void ButtonRegisterHotkeys_Click(object sender, EventArgs e)
        {
        }

        private void ReloadHotkeys()
        {
            HotkeyTools.UpdateHotkeys(mainForm.HotkeyList, MainForm.HotkeyNames, mainForm);
            Debug.WriteLine("Released and re-registered hotkeys");
        }

        public void UpdateTrimCheck()
        {
            checkBoxTrim.Checked = settings.TrimChecked;
        }

        private void CheckBoxRegionComplete_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBoxRegionComplete.Checked)
            {
                checkBoxRegionToFile.Enabled = true;
                checkBoxRegionToClipboard.Enabled = true;
                checkBoxRegionToEditor.Enabled = true;
            }
            else
            {
                checkBoxRegionToFile.Enabled = false;
                checkBoxRegionToClipboard.Enabled = false;
                checkBoxRegionToEditor.Enabled = false;
            }
        }

        private void Label12_Click(object sender, EventArgs e)
        {

        }

        private void ButtonResetOptions_Click(object sender, EventArgs e)
        {
            settings.Reset();
            HotkeyTools.ReleaseHotkeys(mainForm.HotkeyList);
            mainForm.LoadHotkeysFromSettings();
            FillSettings();
        }

        private void ButtonResetCounter_Click(object sender, EventArgs e)
        {
            mainForm.SetCounter(1, true);
            numericUpDownCounter.Value = 1;
        }

        private void TextBoxFilename_TextChanged(object sender, EventArgs e)
        {
            labelFileNameResult.Text = mainForm.ComposeFileName(textBoxFilename.Text, "Title");
        }

        private void SetColor_Click(object sender, EventArgs e)
        {
            if (sender is Button button)
            {
                ColorDialogAlpha dialogAlpha = new(button.BackColor);
                //DialogResult result = colorDialog1.ShowDialog();
                DialogResult result = dialogAlpha.ShowDialog();
                if (result == DialogResult.OK)
                {

                    Color color = dialogAlpha.Color;
                    ColorTools.SetButtonColors(button, color, true);
                    button.Text = color.Name;
                }
                dialogAlpha.Dispose();
            }
        }

        private void CheckBoxSelectAfterPlacingSymbol_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBoxSelectAfterPlacingSymbol.Checked)
            {
                checkBoxSelectAfterFreehand.Enabled = true;
            }
            else
            {
                checkBoxSelectAfterFreehand.Enabled = false;
            }
        }

        private void ButtonSelectStickerFolder_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog dialog = new();
            dialog.ShowDialog();
            textBoxStickerFolder.Text = dialog.SelectedPath;
            dialog.Dispose();
        }
    }
}
