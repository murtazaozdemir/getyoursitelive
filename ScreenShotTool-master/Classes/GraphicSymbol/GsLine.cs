using System.Numerics;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class GsLine : GraphicSymbol
{
    public Point lineEnd;

    public GsLine(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        Name = "Line";
        CheckValid(StartPointV2, EndPointV2);
        EndPoint = endPoint;
        ScalingAllowed = false;
    }

    protected void CheckValid(Vector2 start, Vector2 end)
    {
        float lineLength = Vector2.Distance(start, end);
        if (lineLength > 1)
        {
            ValidSymbol = true;
        }
    }

    public override Point EndPoint { get { return lineEnd; } set { lineEnd = value; } }
    public override int Width { get { return 1; } }
    public override int Height { get { return 1; } }

    public override Rectangle Bounds
    {
        get
        {
            int _left = Math.Min(StartPoint.X, EndPoint.X);
            int _right = Math.Max(StartPoint.X, EndPoint.X);
            int _top = Math.Min(StartPoint.Y, EndPoint.Y);
            int _bottom = Math.Max(StartPoint.Y, EndPoint.Y);
            int _width = _right - _left;
            int _height = _bottom - _top;
            return new Rectangle(_left, _top, _width, _height);
        }
    }

    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        if (LineWeight < 1) { LineWeight = 1; }
        if (LineColor.A > 0)
        {
            graphic.DrawLine(drawPen, new Point(StartPoint.X + offset.X, StartPoint.Y + offset.Y), new Point(EndPoint.X + offset.X, EndPoint.Y + offset.Y));
        }
    }

    public override void DrawShadow(Graphics graphic)
    {
        if (ShadowEnabled)
        {
            int adjustedShadowDistance = Math.Max(2, Math.Min(ShadowDistance, (int)(LineWeight * 0.75f)));
            DrawShape(graphic, ShadowPen, ShadowBrush, new Point(adjustedShadowDistance, adjustedShadowDistance));
        }
    }

    public override void MoveTo(int x, int y)
    {
        Point EndOffset = StartPoint.Subtract(EndPoint);
        StartPoint = new Point(x, y);
        EndPoint = StartPoint.Subtract(EndOffset);
    }

    public override Rectangle GetHitbox(int index)
    {
        return index switch
        {
            0 => HitboxMiddle,
            1 => HitboxStart,
            2 => HitboxEnd,
            _ => new Rectangle(0, 0, 0, 0),
        };
    }

    public float GetLineLength()
    {
        return StartPoint.DistanceTo(EndPoint);
    }

    public Rectangle HitboxStart { get { return new Rectangle(StartPoint.X - anchorHalf, StartPoint.Y - anchorHalf, anchorsize, anchorsize); } }
    public Rectangle HitboxEnd { get { return new Rectangle(EndPoint.X - anchorHalf, EndPoint.Y - anchorHalf, anchorsize, anchorsize); } }
    public Rectangle HitboxMiddle
    {
        get
        {
            return new Rectangle(
                Bounds.Left + (int)(Bounds.Width * 0.2f) - 2,
                Bounds.Top + (int)(Bounds.Height * 0.2f) - 2,
                Math.Max(Bounds.Width - (int)(Bounds.Width * 0.4f), 4),
                Math.Max(Bounds.Height - (int)(Bounds.Height * 0.4f), 4)
            );
        }
    }
}

