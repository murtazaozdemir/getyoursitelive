using ScreenShotTool.Classes;
using System.Diagnostics;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class GsImage : GraphicSymbol
{
    public Bitmap? image;
    Bitmap? rotatedImage;
    Bitmap? shadowImage;
    bool useAdvancedShadow = true;
    bool oldShadowEnabled = false;
    float oldRotation = 0f;
    int oldWidth = 0;
    int oldHeight = 0;
    Point corner1;
    Point corner2;
    Point corner3;
    Point corner4;
    int RotatedWidthOverflow;
    int RotatedHeightOverflow;
    public Rectangle RotatedBounds;

    public static GsImage Create(Point startPoint, Bitmap bitmap)
    {
        GsImage gsImage = new(startPoint, Point.Empty, false)
        {
            image = bitmap,
            Width = bitmap.Width,
            Height = bitmap.Height,
            ValidSymbol = true,
            RotationAllowed = true,
        };
        gsImage.UpdateRotatedBounds();
        return gsImage;
    }

    public static GsImage Create(Point startPoint, SharedBitmap copiedImage, bool checkClipboard)
    {
        bool useClipboard = true;
        GsImage gsImage = new(startPoint, Point.Empty, false);

        Image? clipboardImage = null;
        if (checkClipboard)
        {
            // clipboard data is non-alpha 32bppRGB, so only simple shadows will be used
            clipboardImage = Clipboard.GetImage();
        }

        Debug.WriteLine($"GsImage.Create, copiedImage disposed: {copiedImage.isDisposed}");

        if (copiedImage.isDisposed == false)
        {

            if (clipboardImage != null)
            {
                int clipWidth = clipboardImage.Width;
                int clipHeight = clipboardImage.Height;

                int copiedWidth = copiedImage.Width;
                int copiedHeight = copiedImage.Height;

                if (clipWidth != copiedWidth || clipHeight != copiedHeight)
                {
                    //clipboard data is different, use clipboard
                    copiedImage.DisposeImage();
                    useClipboard = true;
                }
                else
                {
                    //clipboard data is same, use internal with alpha
                    useClipboard = false;
                }
            }

        }
        else
        {
            useClipboard = true;
        }

        if (copiedImage.isDisposed == false && useClipboard == false)
        {
            Debug.WriteLine("GsImage.Create: use internal copied");
            gsImage.image.DisposeAndNull();
            Bitmap? tempBmp = copiedImage.GetBitmap();
            if (tempBmp != null)
            {
                gsImage.image = ImageProcessing.CopyImage(tempBmp);
            }
        }
        else if (clipboardImage != null)
        {
            //Debug.WriteLine("GsImage.Create: use clipboard image");
            gsImage.image = (Bitmap)clipboardImage;
        }
        else
        {
            Debug.WriteLine("GsImage.Create: Neither image was valid (clipboard or copiedImage)");
        }

        if (gsImage.image != null)
        {
            gsImage.ValidSymbol = true;
            gsImage.Width = gsImage.image.Width;
            gsImage.Height = gsImage.image.Height;
        }
        else
        {
            gsImage.ValidSymbol = false;
        }
        return gsImage;
    }

    public GsImage(Point startPoint, Point endPoint, bool shadow) : base(startPoint, endPoint, shadow)
    {
        Name = "Image";
        AllowClickPlacement = true;
    }

    public override void DrawSymbol(Graphics graphic)
    {
        UpdateColors();
        UpdatePen();
        UpdateRotatedBounds();
        if (Rotation != 0 && image != null)
        {
            CreateRotatedImage(image);
        }
        UpdateShadows();
        oldRotation = Rotation;
        oldHeight = Height;
        oldWidth = Width;
        oldShadowEnabled = ShadowEnabled;
        DrawShadow(graphic);
        DrawShape(graphic, LinePen, FillBrush, new Point(0, 0), true, true);
    }

    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        if (image != null)
        {
            if (Rotation != 0)
            {
                if (rotatedImage != null)
                {
                    graphic.DrawImage(rotatedImage, RotatedBounds.Left, RotatedBounds.Top, RotatedBounds.Width, RotatedBounds.Height);
                }
            }
            else
            {
                graphic.DrawImage(image, Left, Top, Width, Height);
            }
        }
    }

    private void CreateRotatedImage(Bitmap image)
    {
        if (Rotation != oldRotation || Width != oldWidth || Height != oldHeight)
        {
            Bitmap tempRotated = new(RotatedBounds.Width, RotatedBounds.Height);
            using (Graphics rotateG = Graphics.FromImage(tempRotated))
            {
                rotateG.ResetTransform();
                float pivotX = RotatedBounds.Width / 2;
                float pivotY = RotatedBounds.Height / 2;

                rotateG.TranslateTransform(pivotX, pivotY);
                rotateG.RotateTransform(Rotation);
                rotateG.TranslateTransform(-pivotX, -pivotY);
                rotateG.DrawImage(image, RotatedWidthOverflow, RotatedHeightOverflow, Width, Height);
            }
            rotatedImage.DisposeAndNull();
            rotatedImage = tempRotated;
        }
    }

    public override void DrawHitboxes(Graphics graphic)
    {
        base.DrawHitboxes(graphic);
        //draws a box around the rotated image when selected
        graphic.DrawLines(HighlightSymbolPen, new Point[] { corner1, corner2, corner3, corner4, corner1 });
    }

    private void UpdateRotatedBounds()
    {
        UpdateCorners();
        int minX = Math.Min(corner1.X, corner2.X);
        minX = Math.Min(minX, corner3.X);
        minX = Math.Min(minX, corner4.X);
        RotatedWidthOverflow = Left - minX;
        int minY = Math.Min(corner1.Y, corner2.Y);
        minY = Math.Min(minY, corner3.Y);
        minY = Math.Min(minY, corner4.Y);
        RotatedHeightOverflow = Top - minY;
        RotatedBounds = new Rectangle(Left - RotatedWidthOverflow, Top - RotatedHeightOverflow, Width + (RotatedWidthOverflow * 2), Height + (RotatedHeightOverflow * 2));
    }

    private void UpdateCorners()
    {
        Point pivot = new(Left + Width / 2, Top + Height / 2);
        corner1 = GetCorner(pivot.X, pivot.Y, Left, Top, Rotation);
        corner2 = GetCorner(pivot.X, pivot.Y, Right, Top, Rotation);
        corner3 = GetCorner(pivot.X, pivot.Y, Right, Bottom, Rotation);
        corner4 = GetCorner(pivot.X, pivot.Y, Left, Bottom, Rotation);
    }



    private static Point GetCorner(float pivotX, float pivotY, float cornerX, float cornerY, double angle)
    {
        //modified from https://jsfiddle.net/w8r/9rnnk545/
        double radians = (Math.PI / 180) * angle;
        double x, y, distance, diffX, diffY;

        /// get distance from center to point
        diffX = cornerX - pivotX;
        diffY = cornerY - pivotY;
        distance = Math.Sqrt(diffX * diffX + diffY * diffY);

        /// find angle from pivot to corner
        radians += Math.Atan2(diffY, diffX);

        /// get new x and y and round it off to integer
        x = pivotX + distance * Math.Cos(radians);
        y = pivotY + distance * Math.Sin(radians);

        return new Point((int)x, (int)y);
    }

    public void UpdateShadows()
    {
        if (image == null)
        {
            return;
        }
        if (image.PixelFormat != System.Drawing.Imaging.PixelFormat.Format32bppArgb)
        {
            //no need for checking alpha shadows on an opaque image
            useAdvancedShadow = false;
        }
        if (ShadowEnabled && useAdvancedShadow)
        {
            if (shadowImage == null || Rotation != oldRotation || Width != oldWidth || Height != oldHeight || oldShadowEnabled != ShadowEnabled)
            {
                shadowImage.DisposeAndNull();
                if (Rotation == 0)
                {
                    shadowImage = CreateAlphaShadow(image);
                }
                else if (rotatedImage != null)
                {
                    shadowImage = CreateAlphaShadow(rotatedImage);
                }
                else
                {
                    Debug.WriteLine("Couldn't create shadow, rotatedImage is null");
                }
            }
        }
    }

    public override void DrawShadow(Graphics graphic)
    {
        int smallestSide = Math.Min(Width, Height);
        int adjustedShadowDistance = Math.Min(ShadowDistance, smallestSide / 10);
        if (ShadowEnabled)
        {
            if (useAdvancedShadow)
            {
                if (shadowImage != null)
                {
                    graphic.DrawImage(shadowImage, new Rectangle(RotatedBounds.Left + adjustedShadowDistance, RotatedBounds.Top + adjustedShadowDistance, RotatedBounds.Width, RotatedBounds.Height));
                }
            }
            else
            {
                DrawSimpleShadow(graphic, adjustedShadowDistance);
            }
        }
    }

    private void DrawSimpleShadow(Graphics graphic, int adjustedShadowDistance)
    {
        Point[] shadowPoints = new[] { corner1, corner2, corner3, corner4, corner1 };
        for (int i = 0; i < shadowPoints.Length; i++)
        {
            shadowPoints[i] = shadowPoints[i].Addition(new Point(adjustedShadowDistance, adjustedShadowDistance));
        }
        graphic.FillPolygon(ShadowBrush, shadowPoints);
    }


    private static Bitmap CreateAlphaShadow(Bitmap source)
    {
        //don't use this on non-32bppARGB, bmppixelsnoop doesn't support it.
        Bitmap shadow = new(source.Width, source.Height);
        using (Graphics g = Graphics.FromImage(shadow))
        {
            using var snoop = new BmpPixelSnoop(source);
            using var target = new BmpPixelSnoop(shadow);
            for (int x = 0; x < source.Width; x++)
            {
                for (int y = 0; y < source.Height; y++)
                {
                    Color sourcePixel = snoop.GetPixel(x, y);
                    target.SetPixel(x, y, Color.FromArgb((int)(sourcePixel.A * 0.2f), Color.Black));
                }
            }
        }
        return shadow;
    }

    public override void DisposeImages()
    {
        image?.DisposeAndNull();
        shadowImage?.DisposeAndNull();
    }
}

