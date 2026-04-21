using System.Diagnostics;
using System.Drawing.Printing;

#pragma warning disable CA1416 // Validate platform compatibility
namespace ScreenShotTool;

// https://learn.microsoft.com/en-us/dotnet/api/system.drawing.printing?view=dotnet-plat-ext-8.0
// other options: https://craftmypdf.com/blog/5-ways-to-generate-pdfs-with-c-sharp/
public class Print
{
    private PrintDocument printDocument;
    public List<string> InstalledPrinters = [];
    public List<string> PdfPrinters = [];
    readonly string DefaultPrinter;
    public Font Font;
    private StreamReader? streamToPrint;
    private PaperSize? sizeA4;
    public float MarginLeftPercent = 10f;
    public float MarginRightPercent = 5f;
    public float MarginTopPercent = 5f;
    public float MarginBottomPercent = 5f;
    public float ImageScale = 100;
    public bool FitToPage = true;

    public Print()
    {
        printDocument = new PrintDocument();
        InstalledPrinters = PrinterSettings.InstalledPrinters.Cast<string>().ToList();
        DefaultPrinter = GetDefaultPrinterName();
        PdfPrinters = GetPDFPrinters();
        this.Font = new Font("Arial", 10);
        sizeA4 = GetPaperSizeByName("A4");
        if (sizeA4 != null)
        {
            printDocument.DefaultPageSettings.PaperSize = sizeA4;
        }
    }


    public bool SelectPrinter(string printerName)
    {
        printDocument.PrinterSettings.PrinterName = printerName;
        return printDocument.PrinterSettings.IsValid;
    }

    public static string GetDefaultPrinterName()
    {
        PrinterSettings settings = new();
        return settings.PrinterName;
    }

    public void SelectDefaultPrinter()
    {
        SelectPrinter(DefaultPrinter);
    }

    private List<string> GetPDFPrinters()
    {
        return GetPrintersByWildcard("PDF");
    }

    public PaperSize PaperSize
    {
        get
        {
            return printDocument.DefaultPageSettings.PaperSize;
        }
        set
        {
            printDocument.DefaultPageSettings.PaperSize = value;
        }
    }

    public List<PaperSize> GetPaperSizes()
    {
        return printDocument.PrinterSettings.PaperSizes.Cast<PaperSize>().ToList();
    }

    public List<string> GetPaperSizeNames()
    {
        List<PaperSize> paperSizes = GetPaperSizes();
        List<string> paperSizeNames = new();
        foreach (PaperSize paperSize in paperSizes)
        {
            paperSizeNames.Add(paperSize.PaperName);
            //Debug.WriteLine(paperSize.PaperName);
        }
        return paperSizeNames;
    }

    public PaperSize? GetPaperSizeByName(string name)
    {
        List<PaperSize> paperSizes = GetPaperSizes();
        foreach (PaperSize paper in paperSizes)
        {
            if (paper.PaperName == name)
                return paper;
        }
        return null;
    }

    public List<string> GetPrintersByWildcard(string wildcard)
    {
        List<string> result = new();
        foreach (string printer in InstalledPrinters)
        {
            if (printer.Contains(wildcard, StringComparison.InvariantCultureIgnoreCase))
            {
                result.Add(printer);
            }
        }
        return result;
    }

    public bool IsPrinterDefault()
    {
        if (printDocument != null && printDocument.PrinterSettings.IsDefaultPrinter)
        {
            //Debug.WriteLine("Printer is default");
            return true;
        }
        else
        {
            //Debug.WriteLine("Printer is not default");
            return true;
        }
    }

    private Bitmap? imageToPrint;
    public void PrintImage(Bitmap image)
    {
        imageToPrint = image;
        printDocument.PrintPage += new PrintPageEventHandler(PrintPageImage);
        printDocument.Print();
    }

    public void Dispose()
    {
        imageToPrint?.Dispose();
    }

    public Rectangle CalculateImageDrawSize(Bitmap image, SizeF canvasSize, bool preview, float dpi = 600)
    {
        float scale = ImageScale / 100f;

        SizeF paperSizePixels = new(PaperSize.Width * dpi / 100f, PaperSize.Height * dpi / 100f);
        float outputRatio = 1;
        if (preview)
        {
            outputRatio = paperSizePixels.Width / canvasSize.Width;
        }


        float left = (canvasSize.Width * (MarginLeftPercent / 100f));
        float right = (canvasSize.Width * (MarginRightPercent / 100f));
        float top = (canvasSize.Height * (MarginTopPercent / 100f));
        float bottom = (canvasSize.Height * (MarginBottomPercent / 100f));
        RectangleF marginRect = new(left, top, canvasSize.Width - right - left, canvasSize.Height - bottom - top);
        SizeF imgDrawSize = new(image.Size.Width / outputRatio * scale, image.Size.Height / outputRatio * scale);
        float imageRatio = imgDrawSize.Width / imgDrawSize.Height;
        if (FitToPage)
        {
            if (imgDrawSize.Width > marginRect.Width)
            {

                imgDrawSize.Width = marginRect.Width;
                imgDrawSize.Height = imgDrawSize.Width / imageRatio;
            }
            if (imgDrawSize.Height > marginRect.Height)
            {
                imgDrawSize.Height = marginRect.Height;
                imgDrawSize.Width = imgDrawSize.Height * imageRatio;
            }
        }
        //Debug.WriteLine($"imgDrawSize {imgDrawSize}");
        return new Rectangle((int)left, (int)top, (int)imgDrawSize.Width, (int)imgDrawSize.Height);
    }

    public Bitmap CreatePreviewImage(Bitmap image, SizeF canvasSize, float dpi = 600)
    {
        Bitmap outputImage = new((int)canvasSize.Width, (int)canvasSize.Height);
        Graphics graphics = Graphics.FromImage(outputImage);
        Rectangle drawRectangle = CalculateImageDrawSize(image, canvasSize, true, dpi);
        graphics.DrawImage(image, drawRectangle);
        graphics.Dispose();
        return outputImage;
    }

    private void PrintPageImage(object sender, PrintPageEventArgs ev)
    {
        if (ev.Graphics == null || imageToPrint == null)
        {
            Debug.WriteLine("PrintPageToText: ev Graphics or image is null");
            return;
        }
        //float leftMargin = ev.MarginBounds.Left;
        //float topMargin = ev.MarginBounds.Top;
        float areaX = (int)printDocument.DefaultPageSettings.PrintableArea.Width;
        float areaY = (int)printDocument.DefaultPageSettings.PrintableArea.Height;
        int dpiX = printDocument.DefaultPageSettings.PrinterResolution.X;
        int dpiY = printDocument.DefaultPageSettings.PrinterResolution.Y;
        float resX = areaX * dpiX / 100f;
        float resY = areaY * dpiY / 100f;
        float scaleToPageX = areaX / resX;
        float scaleToPageY = areaY / resY;
        Rectangle drawRectangle = CalculateImageDrawSize(imageToPrint, new SizeF(resX, resY), preview: false, dpiX);
        int left = (int)(drawRectangle.Left * scaleToPageX);
        int top = (int)(drawRectangle.Top * scaleToPageY);
        int width = (int)(drawRectangle.Width * scaleToPageX);
        int height = (int)(drawRectangle.Height * scaleToPageY);
        Rectangle drawRectangleScaled = new(left, top, width, height);

        // upscale image to reduce noise, 2 seems sufficient
        Bitmap scaledBitmap = ScaleBitmap(imageToPrint, 2, true);
        ev.Graphics.DrawImage(scaledBitmap, drawRectangleScaled);
        scaledBitmap.Dispose();
        ev.HasMorePages = false;
    }

    private static Bitmap ScaleBitmap(Bitmap image, int scaleFactor, bool pixelPerfect)
    {
        Bitmap scaledBitmap = new(image.Width * scaleFactor, image.Height * scaleFactor);
        Graphics g = Graphics.FromImage(scaledBitmap);
        if (pixelPerfect)
        {
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.None;
        }
        else
        {
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
        }
        g.DrawImage(image, new Rectangle(0, 0, scaledBitmap.Width, scaledBitmap.Height));
        g.Dispose();
        //Debug.WriteLine($"Scaled bmp from {image.Size} to {scaledBitmap.Size}");
        return scaledBitmap;
    }

    public void PrintTextFile(string file)//printButton_Click(object sender, EventArgs e)
    {
        try
        {
            streamToPrint = new StreamReader(file);
            try
            {
                printDocument.PrintPage += new PrintPageEventHandler(PrintPageText);
                printDocument.Print();
            }
            finally
            {
                streamToPrint.Close();
                streamToPrint = null;
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.Message);
        }
    }

    // The PrintPage event is raised for each page to be printed.
    private void PrintPageText(object sender, PrintPageEventArgs ev)
    {
        if (streamToPrint == null)
        {
            Debug.WriteLine("PrintPageToText: stream reader streamToPrint is null");
            return;
        }
        if (ev.Graphics == null)
        {
            Debug.WriteLine("PrintPageToText: ev Graphics is null");
            return;
        }

        //ev.PageSettings.PaperSize = printDocument.PrinterSettings.PaperSizes.

        float yPos;
        int count = 0;
        float leftMargin = ev.MarginBounds.Left;
        float topMargin = ev.MarginBounds.Top;
        string? line = null;

        Graphics graphics = ev.Graphics;
        // Calculate the number of lines per page.
        float linesPerPage = ev.MarginBounds.Height / Font.GetHeight(graphics);

        // Print each line of the file.
        while (count < linesPerPage &&
           ((line = streamToPrint.ReadLine()) != null))
        {
            yPos = topMargin + (count *
               Font.GetHeight(graphics));
            graphics.DrawString(line, Font, Brushes.Black,
               leftMargin, yPos, new StringFormat());
            count++;
        }

        // If more lines exist, print another page.
        if (line != null)
            ev.HasMorePages = true;
        else
            ev.HasMorePages = false;
    }
}
