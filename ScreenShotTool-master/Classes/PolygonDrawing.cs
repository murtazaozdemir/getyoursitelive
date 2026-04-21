using System.Numerics;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class PolygonDrawing(Pen pen)
{
    public Point Location = new(0, 0);
    public Size Size;
    private bool noPixelsSet = true;
    public int LeftMostPixel = 0;
    public int RightMostPixel = 0;
    public int TopMostPixel = 0;
    public int BottomMostPixel = 0;

    public List<Point> PointList = [];
    public Pen pen = pen;

    private void UpdateContentBounds(Pen pen, Point point)
    {
        int penRadius = (int)Math.Ceiling(pen.Width / 2f);
        int left = point.X - penRadius;
        int right = point.X + penRadius;
        int top = point.Y - penRadius;
        int bottom = point.Y + penRadius;
        if (noPixelsSet)
        {
            LeftMostPixel = left;
            RightMostPixel = right;
            TopMostPixel = top;
            BottomMostPixel = bottom;
            noPixelsSet = false;
        }
        else
        {
            LeftMostPixel = Math.Min(left, LeftMostPixel);
            RightMostPixel = Math.Max(right, RightMostPixel);
            TopMostPixel = Math.Min(top, TopMostPixel);
            BottomMostPixel = Math.Max(bottom, BottomMostPixel);
        }
    }

    public void AddLine(Point point1, Point point2)
    {
        UpdateContentBounds(pen, point1);
        UpdateContentBounds(pen, point2);
        PointList.Add(point1);
    }

    public void AddPoint(Point point)
    {
        UpdateContentBounds(pen, point);
        PointList.Add(point);
    }

    public Rectangle Contents
    {
        get
        {
            return new Rectangle(LeftMostPixel, TopMostPixel, RightMostPixel - LeftMostPixel, BottomMostPixel - TopMostPixel);
        }
    }

    public void Draw(Graphics graphics, Pen drawPen, Brush drawBrush, int offsetX, int offsetY, bool scale, float Width, float Height, bool closed = false, bool fill = false, float curveTension = 0.5f, bool outline = true)
    {
        graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        int pointsToAdd = 4; // add points between first and last for closed or fill, reduce bulges
        List<Point> offsetPoints = [];
        List<Point> deBulgedPoints = [];
        float scaleWidth = Width / Contents.Width;
        float scaleHeight = Height / Contents.Height;
        for (int i = 0; i < PointList.Count; i++)
        {
            if (scale)
            {
                Point zeroed = PointList[i].Subtract(new Point(Contents.Left, Contents.Top));
                Point scaledPoint = new((int)(zeroed.X * scaleWidth), (int)(zeroed.Y * scaleHeight));
                offsetPoints.Add(scaledPoint.Addition(new Point(offsetX, offsetY)).Addition(new Point(Contents.Left, Contents.Top)));
            }
            else
            {
                offsetPoints.Add(PointList[i].Addition(new Point(offsetX, offsetY)));
            }
        }

        if (closed || fill) // test modulo
        {
            // add that extra points to reduce bulges at start and end
            Point first = offsetPoints.First();
            Point last = offsetPoints.Last();
            float increment = 1f / (pointsToAdd + 1);
            deBulgedPoints = offsetPoints.ToList();
            for (int i = 1; i <= pointsToAdd; i++)
            {
                float t = 1 - (increment * i);
                deBulgedPoints.Add(GetPointAlongLine(first, last, t));
            }

        }

        if (fill)
        {
            if (offsetPoints.Count > 2)
            {
                graphics.FillClosedCurve(drawBrush, deBulgedPoints.ToArray(), System.Drawing.Drawing2D.FillMode.Winding, curveTension);

            }
        }

        if (drawPen.Width > 0 && outline)
        {
            if (closed && offsetPoints.Count > 2)
            {
                graphics.DrawClosedCurve(drawPen, deBulgedPoints.ToArray(), curveTension, System.Drawing.Drawing2D.FillMode.Winding);
            }
            else if (offsetPoints.Count > 1)
            {
                graphics.DrawCurve(drawPen, offsetPoints.ToArray());
            }
        }
    }

    private static Point GetPointAlongLine(Point start, Point end, float t)
    {
        Vector2 vector = new(end.X - start.X, end.Y - start.Y);
        Point offset = new((int)(vector.X * t), (int)(vector.Y * t));
        return start.Addition(offset);
    }

    public void Dispose()
    {

    }
}
