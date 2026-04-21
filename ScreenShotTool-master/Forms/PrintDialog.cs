using System.Diagnostics;
using System.Drawing.Printing;


namespace ScreenShotTool.Forms;
#pragma warning disable CA1416 // Validate platform compatibility

public partial class PrintDialog : Form
{
    public string PrinterName;
    public string PaperSize;
    public bool FitToPage;
    private readonly Bitmap? image;
    readonly string preferredPaperSize = "A4"; // set with settings later?
    readonly bool creationComplete = false;

    private readonly Print printer;

    public PrintDialog(Print print, Bitmap? image, float marginLeft = 5f, float marginRight = 5f, float marginTop = 5f, float marginBottom = 5f)
    {
        InitializeComponent();
        Font = new Font(this.Font.FontFamily, 9);
        printer = print;
        PrinterName = Print.GetDefaultPrinterName();
        comboBoxPrinters.Items.AddRange(print.InstalledPrinters.ToArray());
        comboBoxPrinters.Text = PrinterName;
        UpdatePaperList();
        if (print.GetPaperSizeNames().Contains(preferredPaperSize))
        {
            comboBoxPaper.Text = preferredPaperSize; // set with settings later?
            PaperSize = preferredPaperSize;
        }
        else
        {
            string firstPaper = print.GetPaperSizeNames().First();
            comboBoxPaper.Text = firstPaper;
            PaperSize = firstPaper;
        }

        this.image = image;
        numericMarginLeft.Value = (decimal)marginLeft;
        numericMarginRight.Value = (decimal)marginRight;
        numericMarginTop.Value = (decimal)marginTop;
        numericMarginBottom.Value = (decimal)marginBottom;
        creationComplete = true;
        UpdatePrinterValues();
        UpdatePreview();
    }

    private void ChangePrinter(string printerName)
    {
        PrinterName = printerName;
        if (printer.SelectPrinter(PrinterName) == false)
        {
            Debug.WriteLine($"Invalid printer name {PrinterName}, not set");
        }
    }

    private void UpdatePrinterValues()
    {
        if (creationComplete == false) return;
        printer.MarginLeftPercent = (float)numericMarginLeft.Value;
        printer.MarginRightPercent = (float)numericMarginRight.Value;
        printer.MarginTopPercent = (float)numericMarginTop.Value;
        printer.MarginBottomPercent = (float)numericMarginBottom.Value;
        printer.FitToPage = checkBoxFitToPage.Checked;
        printer.ImageScale = (float)numericImageScale.Value;

        PaperSize? paperSize = printer.GetPaperSizeByName(comboBoxPaper.Text);
        if (paperSize != null)
        {
            printer.PaperSize = paperSize;
            //Debug.WriteLine($"Paper size = {printer.PaperSize.PaperName}");
        }
        else
        {
            Debug.WriteLine("Invalid paper size");
        }
    }

    private void UpdatePreview()
    {
        UpdatePrinterValues();
        if (image != null)
        {
            pictureBoxPreview.Image.DisposeAndNull();
            pictureBoxPreview.Image = printer.CreatePreviewImage(image, pictureBoxPreview.Size);
        }
    }

    private void NumericChanged(object sender, EventArgs e)
    {
        UpdatePreview();
    }

    private void NumericImageScale_ValueChanged(object sender, EventArgs e)
    {
        UpdatePreview();
    }

    private void CheckBoxFitToPage_CheckedChanged(object sender, EventArgs e)
    {
        UpdatePreview();
    }

    private void ComboBoxPrinters_SelectedIndexChanged(object sender, EventArgs e)
    {
        ChangePrinter(comboBoxPrinters.Text);
        UpdatePaperList();

        UpdatePreview();
    }

    private void UpdatePaperList()
    {
        string previousPaper = comboBoxPaper.Text;
        comboBoxPaper.Items.Clear();
        List<string> paperNames = printer.GetPaperSizeNames();
        comboBoxPaper.Items.AddRange(paperNames.ToArray());
        bool foundPaperMatch = false;
        for (int i = 0; i < paperNames.Count; i++)
        {
            if (paperNames[i] == previousPaper)
            {
                comboBoxPaper.SelectedIndex = i;
                foundPaperMatch = true;
                break;
            }
        }
        if (!foundPaperMatch)
        {
            int indexA4 = paperNames.IndexOf("A4");
            if (indexA4 != -1)
            {
                comboBoxPaper.SelectedIndex = indexA4;
            }
            else
            {
                comboBoxPaper.SelectedIndex = 0;
            }
        }
    }

    private void ComboBoxPaper_SelectedIndexChanged(object sender, EventArgs e)
    {
        PaperSize = comboBoxPaper.Text;
        UpdatePreview();
    }
}
