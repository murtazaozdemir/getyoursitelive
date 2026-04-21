using System.Runtime.Versioning;

namespace ScreenShotTool
{
    [SupportedOSPlatform("windows")]
    public class GsHighlight : GsDynamicImage
    {
        //public Bitmap? originalImage;
        private Bitmap? highlightedBmp;
        public ColorBlend.BlendModes blendMode = ColorBlend.BlendModes.Multiply;
        private Color previousColor = Color.White;
        private ColorBlend.BlendModes previousBlendMode = ColorBlend.BlendModes.Multiply;
        DateTime lastLocalUpdate = DateTime.MinValue;
        public float BlendStrengthRed = 1f;
        public float BlendStrengthBlue = 1f;
        public float BlendStrengthGreen = 1f;
        private int TintBrightColorsAdjustment = 64;
        private int TintIntensityAdjustement = 0;
        private int DitherThreshold = 50;
        //object? blendData = null;

        public int AdjustmentValue
        {
            get
            {
                return blendMode switch
                {
                    ColorBlend.BlendModes.Tint => TintIntensityAdjustement,
                    ColorBlend.BlendModes.TintBrightColors => TintBrightColorsAdjustment,
                    ColorBlend.BlendModes.Dither => DitherThreshold,
                    _ => 0
                };
            }
            set
            {
                switch (blendMode)
                {
                    case ColorBlend.BlendModes.Tint:
                        TintIntensityAdjustement = value;
                        break;
                    case ColorBlend.BlendModes.TintBrightColors:
                        TintBrightColorsAdjustment = value;
                        break;
                    case ColorBlend.BlendModes.Dither:
                        DitherThreshold = value;
                        break;
                }
            }
        }

        public GsHighlight(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadow, int lineWidth) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadow, lineWidth)
        {
            Name = "Highlight";
            drawFill = DrawFill;
            base.FillColor = backgroundColor;
        }

        public void DrawFill(Pen pen, Brush fillBrush, Rectangle rect, Graphics graphic, bool enabled = true)
        {
            if (!enabled) { return; }
            if (rect.Width < 1 || rect.Height < 1) return;

            if (SourceImage != null)
            {
                if (highlightedBmp == null || RectChanged(rect) || previousColor != FillColor || previousBlendMode != blendMode || lastLocalUpdate < LastSourceUpdate)
                {
                    //Debug.WriteLine($"highlight update, Last source: {LastSourceUpdate.Millisecond}, local: {lastLocalUpdate.Millisecond}");
                    UpdateHighlightBmp(rect);
                    lastLocalUpdate = DateTime.Now;
                    previousPosition = new Point(rect.Left, rect.Top);
                    previousSize = new Size(rect.Width, rect.Height);
                    previousColor = FillColor;
                    previousBlendMode = blendMode;
                }
                if (highlightedBmp != null)
                {
                    graphic.DrawImage(highlightedBmp, rect);
                }
            }
        }

        public override void DrawShadow(Graphics graphic)
        {
            // no shadow;
        }

        private void UpdateHighlightBmp(Rectangle rect)
        {
            if (SourceImage == null) return;
            highlightedBmp.DisposeAndNull();
            highlightedBmp = new Bitmap(rect.Width, rect.Height);
            int bmpLeft = Left;
            int bmpTop = Top;

            int bmpRight = Math.Min(SourceImage.Width, Right);
            int bmpBottom = Math.Min(SourceImage.Height, Bottom);
            int bmpWidth = bmpRight - bmpLeft;
            int bmpHeight = bmpBottom - bmpTop;

            using var snoop = new BmpPixelSnoop(SourceImage);
            using var target = new BmpPixelSnoop(highlightedBmp);

            object? blendData = null;

            if (blendMode == ColorBlend.BlendModes.Dither)
            {
                blendData = new RowInfo(bmpWidth, bmpLeft, bmpRight);
            }

            for (int y = 0; y < bmpHeight; y++)
            {
                for (int x = 0; x < bmpWidth; x++)
                {
                    int sampleX = bmpLeft + x;
                    int sampleY = bmpTop + y;

                    if (sampleX < 0 || sampleY < 0 || sampleX >= snoop.Width || sampleY >= snoop.Height)
                    {
                        // outside bounds
                        if (blendMode == ColorBlend.BlendModes.Dither && blendData is RowInfo rinfo)
                        {
                            ColorBlend.MoveRowInfoHead(rinfo); // must move the dither x/y head since the BlendColors function is skipped
                        }
                        continue;
                    }
                    Color sourcePixel = snoop.GetPixel(sampleX, sampleY);
                    (Color blended, blendData) = ColorBlend.BlendColors(sourcePixel, FillColor, blendMode, AdjustmentValue, blendData);
                    target.SetPixel(x, y, ApplyChannel(sourcePixel, blended));

                }
            }
        }

        private Color ApplyChannel(Color original, Color blended)
        {
            int R = (int)float.Lerp((float)original.R, blended.R, BlendStrengthRed);
            int G = (int)float.Lerp((float)original.G, blended.G, BlendStrengthGreen);
            int B = (int)float.Lerp((float)original.B, blended.B, BlendStrengthBlue);
            return (Color.FromArgb(original.A, R, G, B));
        }

        public override void DisposeImages()
        {
            highlightedBmp.DisposeAndNull();
            base.DisposeImages();
        }
    }

}