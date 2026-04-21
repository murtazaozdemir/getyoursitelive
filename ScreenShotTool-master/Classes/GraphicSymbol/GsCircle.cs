namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsCircle : GsBoundingBox
{
    public GsCircle(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        Name = "Circle";
        drawFill = DrawFill;
        drawLine = DrawLine;
    }

    public static void DrawLine(Pen pen, Brush lineBrush, Rectangle rect, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        graphic.DrawEllipse(pen, rect);
    }

    public static void DrawFill(Pen pen, Brush fillBrush, Rectangle rect, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        graphic.FillEllipse(fillBrush, rect);
    }
}

