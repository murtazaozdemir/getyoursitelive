namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsBlur : GsDynamicImage
{
    bool isTempSymbol = false;
    public int BlurRadius = 1;
    public int MosaicSize = 10;

    private GsBlur(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor) : base(startPoint, endPoint, foregroundColor, backgroundColor)
    {
        Name = "Blur";
        drawFill = DrawFill;
    }

    public static GsBlur Create(Point startPoint, Point endPoint, bool temp, int mosaicSize, int blurRadius)
    {
        Color lineColor = Color.Transparent;
        if (temp)
        {
            lineColor = Color.Red;
        }
        GsBlur newSymbol = new(startPoint, endPoint, lineColor, Color.White)
        {
            isTempSymbol = temp,
            MosaicSize = mosaicSize,
            BlurRadius = blurRadius,
        };
        return newSymbol;
    }

    public void DrawFill(Pen pen, Brush fillBrush, Rectangle rect, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        if (SourceImage == null)
        {
            graphic.DrawRectangle(LinePen, Left, Top, Width, Height);
        }
        else
        {
            if (SourceImage != null)
            {
                graphic.DrawImage(SourceImage, Bounds, Bounds, GraphicsUnit.Pixel);
            }

            if (isTempSymbol)
            {
                // draw this outline during creation with temp symbol, line will be transparent after permanent symbol is created
                graphic.DrawRectangle(LinePen, Left, Top, Width, Height);
            }
        }
    }

    public override void DrawShadow(Graphics graphic)
    {
        // no shadow
    }

    readonly Brush blackBrush = new SolidBrush(Color.Black);
    Bitmap CropImage(Bitmap img, Rectangle cropArea)
    {
        //https://www.codingdefined.com/2015/04/solved-bitmapclone-out-of-memory.html
        Bitmap bmp = new(cropArea.Width, cropArea.Height);

        using (Graphics gph = Graphics.FromImage(bmp))
        {
            gph.FillRectangle(blackBrush, new Rectangle(0, 0, 100, 100));
            gph.DrawImage(img, new Rectangle(0, 0, bmp.Width, bmp.Height), cropArea, GraphicsUnit.Pixel);
        }
        return bmp;
    }

    public override void DisposeImages()
    {
        SourceImage.DisposeAndNull();
        base.DisposeImages();
    }
}

