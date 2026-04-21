namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsDrawing : GraphicSymbol
{
    public Bitmap? drawing;
    bool drawingIsCloned = false;
    bool temp = true;
    PolygonDrawing? Polygon;

    private GsDrawing(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled = false, int lineWeight = 1) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        ValidSymbol = true;
        Name = "Freehand";
        //ScalingAllowed = false;
    }

    public static GsDrawing Create(Point TopLeft, Point BottomRight, PolygonDrawing? newPolygon, bool temp, Color lineColor)
    {
        if (newPolygon != null)
        {
            GsDrawing newSymbol = new GsDrawing(TopLeft, new Point(newPolygon.Contents.Width, newPolygon.Contents.Height), lineColor, Color.Empty, false, 1);
            if (temp)
            {
                newSymbol.drawing = newPolygon.ToBitmap();
                newSymbol.Polygon = newPolygon;
                newSymbol.Left = 0;
                newSymbol.Right = 100; // these numbers are irrelevant, only matters in the realized symbol
                newSymbol.Top = 0;
                newSymbol.Bottom = 100;
                newSymbol.drawingIsCloned = false;
            }
            else
            {
                newSymbol.drawing = newPolygon.ToBitmap(); //EditorCanvas.CropImage(drawing.Bitmap, drawing.Contents);
                newSymbol.Left = newPolygon.Contents.Left;
                newSymbol.Top = newPolygon.Contents.Top;
                newSymbol.Width = newPolygon.Contents.Width;
                newSymbol.Height = newPolygon.Contents.Height;
                newSymbol.drawingIsCloned = true;
            }
            newSymbol.temp = temp;
            return newSymbol;
        }

        GsDrawing badSymbol = new GsDrawing(new Point(0, 0), new Point(10, 10), Color.Red, Color.Green, false, 1);
        badSymbol.ValidSymbol = false;
        return badSymbol;
    }

    public override void DrawSymbol(Graphics graphic)
    {
        if (drawing != null)
        {
            if (temp)
            {
                if (Polygon != null)
                {
                    graphic.DrawImageUnscaled(drawing, new Point(Left + Polygon.LeftMostPixel, Top + Polygon.TopMostPixel));
                }
            }
            else
            {
                //graphic.DrawImageUnscaled(drawing, new Point(Left, Top));
                graphic.DrawImage(drawing, Left, Top, Width, Height);
            }
        }
    }

    public override void DisposeImages()
    {
        // don't dispose the drawing if it's used by the temp image process outside.
        if (drawingIsCloned && temp == false)
        {
            drawing.DisposeAndNull();
        }
        base.DisposeImages();
    }
}
