using PdfSharp.Drawing;
using PdfSharp.Pdf;
using System.Diagnostics;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

// this class uses PDFshart-GDI

public static class SaveToPdf
{
    public static void Save(string filePath, Bitmap image, float margins, float imageScale)
    {
        string fileName = Path.GetFileName(filePath);
        string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);

        PdfDocument document = new();
        document.Info.Title = fileNameWithoutExtension;
        document.Info.Subject = "Image from Screenshot Tool";
        //document.Info.CreationDate = DateTime.Now;

        PdfPage page = document.AddPage();
        XGraphics gfx = XGraphics.FromPdfPage(page);
        //XUnit width = page.Width;

        XImage ximg = XImage.FromGdiPlusImage(image);
        Debug.WriteLine($"pageSize {gfx.PageSize}");
        double insideWidth = gfx.PageSize.Width - (margins * 2f);
        double insideHeight = gfx.PageSize.Width - (margins * 2f);
        RectangleF drawSize = CalculateImageDrawSize(ximg, new(0, 0, (float)insideWidth, (float)insideHeight), imageScale);
        Debug.WriteLine($"margins {margins}");
        RectangleF finalRect = new(margins, margins, drawSize.Width, drawSize.Height);
        Debug.WriteLine($"Draw to rectangle {finalRect}");
        gfx.DrawImage(ximg, finalRect);

        //XFont font = new XFont("Verdana", 20, XFontStyleEx.Bold);
        //gfx.DrawString("Hello, World!", font, XBrushes.Black,
        //  new XRect(0, 0, page.Width, page.Height),
        //  XStringFormats.Center);



        try
        {
            document.Save(filePath);
            Debug.WriteLine($"SaveToPdf: Saved to {filePath}, pages {document.PageCount}");
        }
        catch (Exception e)
        {
            Debug.WriteLine($"Couldn't save to file {filePath}, \n {e.Message}");
        }
    }

    public static RectangleF CalculateImageDrawSize(XImage image, RectangleF marginRect, float scale)
    {
        SizeF imgDrawSize = new((float)image.Size.Width * scale, (float)image.Size.Height * scale);
        float imageRatio = imgDrawSize.Width / imgDrawSize.Height;

        if (imgDrawSize.Width > marginRect.Width)
        {
            Debug.WriteLine("Too wide");
            imgDrawSize.Width = marginRect.Width;
            imgDrawSize.Height = imgDrawSize.Width / imageRatio;
        }
        if (imgDrawSize.Height > marginRect.Height)
        {
            Debug.WriteLine("Too tall");
            imgDrawSize.Height = marginRect.Height;
            imgDrawSize.Width = imgDrawSize.Height * imageRatio;
        }

        Debug.WriteLine($"imgDrawSize {imgDrawSize}");
        return new RectangleF(0f, 0f, imgDrawSize.Width, imgDrawSize.Height);
    }

    public static void SavePdfSample(string filename)
    {
        // Create a new PDF document.
        var document = new PdfDocument();
        document.Info.Title = "Created with PDFsharp";
        document.Info.Subject = "Just a simple Hello-World program.";

        // Create an empty page in this document.
        var page = document.AddPage();

        // Get an XGraphics object for drawing on this page.
        var gfx = XGraphics.FromPdfPage(page);

        // Draw two lines with a red default pen.
        var width = page.Width;
        var height = page.Height;
        gfx.DrawLine(XPens.Red, 0, 0, width, height);
        gfx.DrawLine(XPens.Red, width, 0, 0, height);

        // Draw a circle with a red pen which is 1.5 point thick.
        var r = width / 5;
        gfx.DrawEllipse(new XPen(XColors.Red, 1.5), XBrushes.White, new XRect(width / 2 - r, height / 2 - r, 2 * r, 2 * r));

        // Create a font.
        var font = new XFont("Times New Roman", 20, XFontStyleEx.BoldItalic);

        // Draw the text.
        gfx.DrawString("Hello, PDFsharp!", font, XBrushes.Black,
            new XRect(0, 0, page.Width, page.Height), XStringFormats.Center);

        // Save the document...
        Debug.WriteLine($"SaveToPdf: Saving sample to {filename}, pages {document.PageCount}");
        document.Save(filename);
        // ...and start a viewer.
        Process.Start(new ProcessStartInfo(filename) { UseShellExecute = true });
    }
}

//void DrawImage(XGraphics gfx, int number)
//{
//    BeginBox(gfx, number, "DrawImage (original)");

//    XImage image = XImage.FromFile(jpegSamplePath);

//    // Left position in point
//    double x = (250 - image.PixelWidth * 72 / image.HorizontalResolution) / 2;
//    gfx.DrawImage(image, x, 0);

//    EndBox(gfx);
//}
