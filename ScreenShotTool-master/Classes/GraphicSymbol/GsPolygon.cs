namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsPolygon : GraphicSymbol
{
    PolygonDrawing? Polygon;
    bool isTemporarySymbol = false;
    public bool closedCurve = false;
    public float curveTension = 0.5f;

    public GsPolygon(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        ValidSymbol = true;
        Name = "Freehand Curve";
    }

    public static GsPolygon Create(Point TopLeft, PolygonDrawing? newPolygon, bool isTemporarySymbol, Color lineColor, Color fillColor, int lineWeight, bool shadow, bool closedCurve)
    {
        if (newPolygon != null)
        {
            GsPolygon newSymbol = new GsPolygon(TopLeft, new Point(newPolygon.Contents.Width, newPolygon.Contents.Height), lineColor, fillColor, false, lineWeight);
            if (isTemporarySymbol)
            {
                newSymbol.Polygon = newPolygon;
                //newSymbol.Left = newPolygon.LeftMostPixel;
                //newSymbol.Top = newPolygon.TopMostPixel;
                newSymbol.ShadowEnabled = shadow;
            }
            else
            {
                newSymbol.Polygon = newPolygon;
                newSymbol.Left = newPolygon.Contents.Left;
                newSymbol.Top = newPolygon.Contents.Top;
                newSymbol.Width = newPolygon.Contents.Width;
                newSymbol.Height = newPolygon.Contents.Height;
                newSymbol.ShadowEnabled = shadow;
            }
            newSymbol.LinePen.StartCap = System.Drawing.Drawing2D.LineCap.Round;
            newSymbol.LinePen.EndCap = System.Drawing.Drawing2D.LineCap.Round;
            newSymbol.LinePen.MiterLimit = lineWeight;
            newSymbol.LinePen.LineJoin = System.Drawing.Drawing2D.LineJoin.Round;
            newSymbol.isTemporarySymbol = isTemporarySymbol;
            newSymbol.closedCurve = closedCurve;
            //newSymbol.fillCurve = fillColor.A > 0;
            return newSymbol;
        }

        GsPolygon badSymbol = new(new Point(0, 0), new Point(10, 10), Color.Red, Color.Green, false, 1)
        {
            ValidSymbol = false
        };

        return badSymbol;
    }

    public override void DrawSymbol(Graphics graphic)
    {
        UpdateColors();
        UpdatePen();
        DrawShadow(graphic);
        DrawShape(graphic, LinePen, FillBrush, new Point(0, 0), true, true);
    }


    internal override void UpdatePen()
    {
        //LineBrush = new SolidBrush(LineColor);
        //LinePen.Brush = LineBrush;
        LinePen.Color = LineColor;
        LinePen.Width = LineWeight;

        FillBrush = new SolidBrush(FillColor);
        ShadowBrush.Color = Color.FromArgb(FillBrush.Color.A / 8, Color.Black);
        ShadowPen.Color = Color.FromArgb(LineBrush.Color.A / 8, Color.Black);
        ShadowPen.Width = LineWeight;

        TextBrush.Color = TextColor;
    }

    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        if (Polygon != null)
        {
            bool fillCurve = FillColor.A > 0;
            if (isTemporarySymbol)
            {
                // don't move the symbol around during drawing
                Polygon.Draw(graphic, drawPen, drawBrush, offset.X, offset.Y, false, 0, 0, closedCurve, fillCurve, curveTension, outline);
            }
            else
            {
                // move the symbol into new place if it's moved from drawn location
                Polygon.Draw(graphic, drawPen, drawBrush, Left - Polygon.LeftMostPixel + offset.X, Top - Polygon.TopMostPixel + offset.Y, true, Width, Height, closedCurve, fillCurve, curveTension, outline);
            }
        }
    }

    public override void DrawShadow(Graphics graphic)
    {
        if (ShadowEnabled)
        {
            if (FillColor.A > 0)
            {
                bool DrawShadowLine = (FillColor.A < 128);
                int largestSide = Math.Max(Width, Height);
                int adjustedShadowDistanceFill = Math.Min(ShadowDistance, largestSide / 5);
                DrawShape(graphic, ShadowPen, ShadowBrush, new Point(adjustedShadowDistanceFill, adjustedShadowDistanceFill), true, DrawShadowLine);
            }
            else
            {
                int adjustedShadowDistanceLine = Math.Max(2, Math.Min(ShadowDistance, (int)(LineWeight * 0.75f)));
                DrawShape(graphic, ShadowPen, ShadowBrush, new Point(adjustedShadowDistanceLine, adjustedShadowDistanceLine));
            }
        }
    }
}
