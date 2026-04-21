using System.Diagnostics;
using System.Drawing.Imaging;
using System.Runtime.Versioning;

namespace ScreenShotTool;
[SupportedOSPlatform("windows")]

public static class ImageProcessing
{

    public static Bitmap? ImageToBitmap32bppArgb(Image? img, bool disposeSource)
    {
        Bitmap? clone = null;
        if (img != null)
        {
            clone = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb);
            using (Graphics gr = Graphics.FromImage(clone))
            {
                gr.DrawImage(img, new Rectangle(0, 0, clone.Width, clone.Height));
            }
            if (disposeSource)
            {
                img.Dispose();
            }
        }
        return clone;
    }

    public static Bitmap CreateBlurImage(Bitmap? sourceBitmap, int blurPixelSize, Rectangle blurBounds, int blurRadius)
    {
        if (sourceBitmap == null)
        {
            Debug.WriteLine("Couldn't create blur image, originalImage is null");
            return new Bitmap(100, 100);
        }
        Stopwatch sw = new(); // for measuring the time it takes to create the blur image
        sw.Start();
        //blurImage.DisposeAndNull();

        Bitmap blurImage = new(sourceBitmap.Width, sourceBitmap.Height);
        Graphics graphics = Graphics.FromImage(blurImage);
        Color pixelColor = Color.Black;
        SolidBrush blurBrush = new(pixelColor);



        using (var snoop = new BmpPixelSnoop((Bitmap)sourceBitmap))
        {
            int tilesDrawn = 0;
            for (int x = Math.Max(0, blurBounds.Left); x < sourceBitmap.Width && x < blurBounds.Right; x += blurPixelSize)
            {
                for (int y = Math.Max(0, blurBounds.Top); y < sourceBitmap.Height && y < blurBounds.Bottom; y += blurPixelSize)
                {
                    pixelColor = SamplePixelArea(snoop, blurRadius, x + blurRadius, y + blurRadius);
                    blurBrush.Color = pixelColor;
                    graphics.FillRectangle(blurBrush, new Rectangle(x, y, blurPixelSize, blurPixelSize));
                    tilesDrawn++;
                }
            }
        }

        graphics.Dispose();
        blurBrush.Dispose();
        sw.Stop();
        //Debug.WriteLine($"Blur took {sw.ElapsedMilliseconds}");
        return blurImage;
    }

    private static Color SamplePixelArea(BmpPixelSnoop sourceImage, int blurRadius, int x, int y)
    {
        Color sampleColor;
        Color pixelColor;
        int sampleX;
        int sampleY;
        int R = 0;
        int G = 0;
        int B = 0;
        int samples = 0;
        for (int i = -blurRadius; i <= blurRadius; i++)
        {
            for (int j = -blurRadius; j <= blurRadius; j++)
            {
                sampleX = x + i;
                sampleY = y + j;
                sampleX = Math.Clamp(sampleX, 0, sourceImage.Width - 1);
                sampleY = Math.Clamp(sampleY, 0, sourceImage.Height - 1);
                sampleColor = sourceImage.GetPixel(sampleX, sampleY);
                R += sampleColor.R;
                G += sampleColor.G;
                B += sampleColor.B;
                samples++;
            }
        }
        pixelColor = Color.FromArgb(R / samples, G / samples, B / samples);
        return pixelColor;
    }

    public static Bitmap CropImage(Bitmap img, Rectangle cropArea)
    {
        //https://www.codingdefined.com/2015/04/solved-bitmapclone-out-of-memory.html
        Bitmap bmp = new(cropArea.Width, cropArea.Height);

        using (Graphics gph = Graphics.FromImage(bmp))
        {
            gph.DrawImage(img, new Rectangle(0, 0, bmp.Width, bmp.Height), cropArea, GraphicsUnit.Pixel);
        }
        return bmp;
    }

    public static Bitmap CopyImage(Bitmap img)
    {
        Rectangle cropArea = new(0, 0, img.Width, img.Height);
        //https://www.codingdefined.com/2015/04/solved-bitmapclone-out-of-memory.html
        Bitmap bmp = new(cropArea.Width, cropArea.Height);

        using (Graphics gph = Graphics.FromImage(bmp))
        {
            gph.DrawImage(img, new Rectangle(0, 0, bmp.Width, bmp.Height), cropArea, GraphicsUnit.Pixel);
        }
        return bmp;
    }

    public static Bitmap CaptureBitmap(int x, int y, int width, int height)
    {
        Bitmap captureBitmap = new(width, height, PixelFormat.Format32bppRgb); //Format32bppRgb Format32bppArgb
        Graphics captureGraphics = Graphics.FromImage(captureBitmap);

        Rectangle captureRectangle = new(x, y, width, height);

        //Copying Image from The Screen
        captureGraphics.CopyFromScreen(captureRectangle.Left, captureRectangle.Top, 0, 0, captureRectangle.Size);
        // alternate but slower capture method: https://www.c-sharpcorner.com/article/screen-capture-and-save-as-an-image/

        captureGraphics.Dispose();
        return captureBitmap;
    }
}
