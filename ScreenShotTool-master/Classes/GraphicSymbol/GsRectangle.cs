namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class GsRectangle : GsBoundingBox
{
    public GsRectangle(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        Name = "Rectangle";
        drawFill = DrawFill;
        drawLine = DrawLine;
    }


    public static void DrawLine(Pen pen, Brush lineBrush, Rectangle rect, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.None;
        graphic.DrawRectangle(pen, rect);
        graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
    }

    public static void DrawFill(Pen pen, Brush fillBrush, Rectangle rect, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        graphic.FillRectangle(fillBrush, rect);
    }
}

