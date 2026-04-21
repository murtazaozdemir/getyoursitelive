namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class GsBorder : GsBoundingBox
{
    private int borderWeight;
    //private readonly int originalWidth = 0;
    //private readonly int originalHeight = 0;
    Pen borderPen = new Pen(Color.Black, 1);
    public GsBorder(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        Name = "Border";
        drawLine = DrawBorder;
        ScalingAllowed = false;
        MoveAllowed = false;
    }

    public void DrawBorder(Pen pen, Brush b, Rectangle r, Graphics graphic, bool enabled = true)
    {
        if (!enabled) { return; }
        Left = 0;
        Top = 0;
        Width = ContainerBounds.Width;
        Height = ContainerBounds.Height;
        borderPen.Color = LineColor;

        borderPen.Width = LineWeight;
        borderPen.Alignment = System.Drawing.Drawing2D.PenAlignment.Inset;
        graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.None;
        if (LineWeight == 1)
        {
            graphic.DrawRectangle(borderPen, new Rectangle(Left, Top, Width - 1, Height - 1));
        }
        else
        {
            graphic.DrawRectangle(borderPen, new Rectangle(Left, Top, Width, Height));
        }
        graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
    }

    public override int LineWeight
    {
        get
        {
            return borderWeight;
        }
        set
        {
            borderWeight = value;
            //Left = 0 + (borderWeight / 2);
            //Top = 0 + (borderWeight / 2);

            ////Right = originalWidth - (int)Math.Ceiling(borderWeight / 2f);
            ////Bottom = originalHeight - (int)Math.Ceiling(borderWeight / 2f);
            //Right = ContainerBounds.Width - (int)Math.Ceiling(borderWeight / 2f);
            //Bottom = ContainerBounds.Height - (int)Math.Ceiling(borderWeight / 2f);
        }
    }
}

