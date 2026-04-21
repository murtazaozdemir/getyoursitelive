using ScreenShotTool.Forms;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsText : GraphicSymbol
{
    public FontFamily fontFamily = FontFamily.GenericSansSerif;
    public float fontEmSize = 10f;
    //public float fontSize = 10f;
    public FontStyle fontStyle = FontStyle.Regular;
    Font font;
    public string Text = "Text";
    readonly int maxFontSize;
    readonly int minFontSize;
    private System.Drawing.Text.TextRenderingHint TextRenderingHint = System.Drawing.Text.TextRenderingHint.SystemDefault;
    public string TextRenderingHintName = "AntiAliasGridFit";

    public GsText(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled)
    {
        Name = "Text";
        Width = endPoint.X;
        Height = endPoint.Y;
        if (Width > 0 && Height > 0)
        {
            ValidSymbol = true;
        }

        maxFontSize = ScreenshotEditor.maxFontSize;
        minFontSize = ScreenshotEditor.minimumFontSize;
        fontEmSize = Math.Clamp((Math.Abs(Width) + Math.Abs(Height)) / 4f, minFontSize, maxFontSize);
        font = CreateFont();
        ScalingAllowed = false;
        FillColor = foregroundColor;
    }

    public static GsText Create(Point startPoint, Color foregroundColor, string text, int fontSize)
    {
        GsText newSymbol = new GsText(startPoint, startPoint.Addition(new Point(10, 10)), foregroundColor, Color.Transparent, false)
        {
            Text = text,
            fontEmSize = fontSize
        };
        return newSymbol;
    }

    private Font CreateFont()
    {
        ShadowDistance = Math.Clamp((int)fontEmSize / 10, 1, 10);
        return new Font(fontFamily, fontEmSize, fontStyle);
    }

    public void UpdateFont()
    {
        font = CreateFont();
    }

    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        if (TextColor.A > 0)
        {
            Brush tempBrush = TextBrush;
            if (drawBrush == ShadowBrush)
            {
                tempBrush = ShadowBrush;
            }
            UpdateFont();
            //graphic.PageUnit = GraphicsUnit.Pixel;
            //StringFormat stringFormat = new StringFormat();
            //stringFormat.FormatFlags = StringFormatFlags.NoWrap;
            System.Drawing.Text.TextRenderingHint previousRenderer = graphic.TextRenderingHint;
            graphic.TextRenderingHint = GetTextRenderingHint(TextRenderingHintName);
            graphic.DrawString(Text, font, tempBrush, new PointF(Left + offset.X, Top + offset.Y));
            SizeF sizeInPixels = graphic.MeasureString(Text, font);
            Width = (int)sizeInPixels.Width;
            Height = (int)sizeInPixels.Height;
            graphic.TextRenderingHint = previousRenderer;
        }
    }

    private System.Drawing.Text.TextRenderingHint GetTextRenderingHint(string name)
    {
        // SystemDefault
        // SingleBitPerPixelGridFit
        // SingleBitPerPixel
        // AntiAlias
        // AntiAliasGridFit
        // ClearTypeGridFit
        switch (name)
        {
            case "SystemDefault": return System.Drawing.Text.TextRenderingHint.SystemDefault;
            case "SingleBitPerPixelGridFit": return System.Drawing.Text.TextRenderingHint.SingleBitPerPixelGridFit;
            case "SingleBitPerPixel": return System.Drawing.Text.TextRenderingHint.SingleBitPerPixel;
            case "AntiAlias": return System.Drawing.Text.TextRenderingHint.AntiAlias;
            case "AntiAliasGridFit": return System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;
            case "ClearTypeGridFit": return System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;
        }
        return TextRenderingHint;
    }

    internal override void UpdatePen()
    {
        FillColor = LineColor; // ensures that shadows are drawn based on the correct alpha
        base.UpdatePen();
    }

    public override void DrawHitboxes(Graphics graphic)
    {
        graphic.DrawRectangle(HighlightSymbolPen, Bounds);
    }
}

